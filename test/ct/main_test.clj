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
            [ct.main :refer :ally]
))


(deftest connection-test
  (testing "that it creates a transaction file in the current epoch"
    (is (=
         {:epochs {"e-0" {:txfs {"my-file" 1}}}}
         (open-connection {:epochs {"e-0" {}}} "me" "my-file")))))


(deftest account-state-test
  (let [initial-db  {:accts {"payer" {:vs {"e0" 1000}}
                             "payee" {:vs {"e0" 500}}}
                     }
        db (advise initial-db "tx-1" "payer" -100)]
    (testing "after reservation"
      (testing "balance is unchanged"
        (is (= 1000
               (-> db (get-balance "e0" "payer")))))
      (testing "available amt is reduced"
        (is (= 900
               (-> db (get-available "payer"))))))
    (let [db (advise db "tx-1" "payee" 100)]
      (testing "after advise"
        (testing "payee available amt is updated"
          (is (= 600
                 (get-available db "payee"))))
        (testing "balance is unchanged"
          (is (= 500
                 (get-balance db "e0" "payee"))))))))
