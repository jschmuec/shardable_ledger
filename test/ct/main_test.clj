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

            [ct.db :as db]
            [ct.acct :as acct]
            [ct.epoch :as epoch]
            [ct.main :refer :all]
            )
  (:import (java.util.regex Pattern)))

(st/instrument)

(deftest full-transaction-test
  (let [tf "test-file"
        tx-id "tx-1"
        payer "payer"
        payee "payee"
        [db epoch-id] (open-connection {} tf)
        db (add-doc-to-tx db tf tx-id payer)
        db (advise db tf tx-id payer -100)
        db (add-doc-to-tx db tf tx-id payee)
        db (advise db tf tx-id payee 100)
        db (close-tx db tf tx-id)
        db (close-txf db tf)
]
    (testing "available amt payer is -100"
      (is (= -100
             (get-available db payer))))
    (testing "available amt payee is 100"
      (is (= 100
             (get-available db payee))))
    (testing "consolidation steps"
      (do 
        (let [
              db (mark-epoch-closed db epoch-id)
              db (consolidate-acct db epoch-id payer tx-id )
              db (consolidate-acct db epoch-id payee tx-id)
              db (mark-epoch-consolidated db epoch-id)
              ]
          (testing "balance of payer is correct"
            (is (= -100
                   (get-balance db epoch-id "payer")))
            )
          (testing "balance of payee is correct"
            (is (= 100
                   (get-balance db epoch-id "payee")))
            ))))
    ))


(deftest connection-test
  (testing "that it creates a transaction file in the current epoch"
    (is (= [{:meta {:open-epoch 1},
             :epochs {1 {:txfs #{"my-file"}}}}
            1
            ]
         (open-connection {:meta {:open-epoch 1}}
                          "my-file"))))
  (testing "that it creates a new epoch if the current one is closed"
    (is (= [{:meta {:open-epoch 2}
             :epochs {1 {:closed true},
                      2 {:txfs #{"my-file"}}}}
            2]
           (open-connection {:meta {:open-epoch 2}, 
                             :epochs {1 {:closed true}}}

                            "my-file")))))

(defn- qm 
  "helps dealing with special chars in assertion messages bny quoting them"
  [m]
  (-> m Pattern/quote Pattern/compile))

(deftest consolidate-acct-test
  (testing "fails if epoch isn't closed"
    (is (thrown-with-msg? AssertionError (qm  "Assert failed: (epoch-closed? db epoch-id)") 
                (consolidate-acct {} 0 "payer" "tx-1")))))

(deftest close-epoch-test
  (testing "fails if not all txfs have been closed"
    (is (thrown-with-msg? AssertionError (qm "Assert failed: (all-txfs-closed? db epoch-id)")
                          (mark-epoch-closed {:epochs {11 {:txfs #{"open-file"}}},
                                              :txfs {"open-file" {}}}
                                             11
                                             )))))

(deftest ^:pending pending-tests
  (testing "that epoch cannot be closed if not all txfs are closed"))
