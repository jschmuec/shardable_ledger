(ns ct.main-test
  (:require [clojure.test :refer [deftest testing is] :as ct]
            [clojure.spec.alpha :as s]
            [clojure.test.check :as tc]
            [clojure.test.check.generators :as tcg]
            [clojure.test.check.clojure-test :refer [defspec]]
            [clojure.test.check.properties :as tcp]
            [com.gfredericks.test.chuck.clojure-test :refer [for-all checking]]
            [clojure.spec.gen.alpha :as gen]
            [clojure.spec.test.alpha :as st]
            [com.gfredericks.test.chuck :as chuck]
            [ct.acct :as acct]
            [ct.epoch :as epoch]
))

(defn get-latest-epoch
  "returns the id of the latest consolidated epoch"
  [db]
  (-> db :meta :current))

(defn get-value
  "returns the value of a document"
  [db col doc epoch]
  (-> db
      (get col)
      (get doc)
      (get epoch)
      (get :value)))

(defn get-available-amt
  [db acct]
  (-> db
      :accts
      (get acct)
      vals
      last
      acct/calculate-pending))

(defn close-epoch
  [db epoch]
  (update-in db [:epochs epoch] epoch/close))

(s/def ::db map?)

(do 
  (defn set-tx-to-processed
    [db epoch tx-id]
    (update-in db [:epochs epoch] epoch/flag-tx-as-processed tx-id))

  (s/fdef set-tx-to-processed
    :args (s/cat :db ::db :epoch any? :tx-id any?))
  (st/instrument))

(defn process-txs
  [db epoch tx-id]
  (reduce #(update-in %1 [:accts %2] acct/update-acct-balance epoch tx-id)
          db
          (get-in db [:epochs epoch :pending tx-id])))

(defn consolidate
  [db epoch]
  (-> db 
      (process-txs "e-1" "tx-1")
      (set-tx-to-processed "e-1" "tx-1")
      (update-in [:epochs "e-1"] epoch/consolidate)))

(def pre-close-epoch
  {:meta {:current "e-0"}
   :epochs {"e-1" {:status :open 
                   :pending {"tx-1" ["acct-0" "payer"]}}}
   :accts {"acct-0" {"e-0" {:value 100 :pending {"tx-1" 100}} }
           "payer" {"e-0" {:value 100 :pending {"tx-1" -100}}}}
   })

(def pre-consolidation
  {:meta {:current "e-0"}
   :epochs {"e-1" {:status :closed ;; meaning we cannot add more transactions to it
                   :pending {"tx-1" ["acct-0" "payer"]}}}
   :accts {"acct-0" {"e-0" {:value 100 :pending {"tx-1" 100}} }
           "payer" {"e-0" {:value 100 :pending {"tx-1" -100}}}}})

(deftest close-epoch-test
  (testing "closing e-1 with static data"
    (is (= pre-consolidation
           (close-epoch pre-close-epoch "e-1")))))

(def fully-processed-data
  {:meta {:current "e-0"}
   :epochs {"e-1" {:status :consolidated ;; it's done and dusted
                   :processed {"tx-1" ["acct-0" "payer"]}}}
   :accts {"acct-0" {"e-0" {:value 100 :pending {"tx-1" 100}} 
                     "e-1" {:value 200 :processed {"tx-1" 100} :pending {}}}
           "payer" {"e-0" {:value 100 :pending {"tx-1" -100}}
                    "e-1" {:value 0 :processed {"tx-1" -100} :pending {}}}}})

(st/instrument)

(deftest post-test
  (testing "retrieving the right balance for epoch 0"
    (is (= 100
            (get-value fully-processed-data
             :accts
             "acct-0"
             "e-0")
           ))
    )
    (testing "retrieving the right balance for epoch 1"
    (is (= 200
            (get-value fully-processed-data
             :accts
             "acct-0"
             "e-1")
           ))
    )
  (testing "available balance is correct for acct-0"
    (is (= 200
           (get-available-amt fully-processed-data "acct-0"))))
 )

(deftest consolidation-test
  (testing "consolidation works"
    (is (= fully-processed-data
           (consolidate pre-consolidation "e-1")))))

