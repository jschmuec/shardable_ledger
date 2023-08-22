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
))

(st/instrument)

(deftest connection-test
  (testing "that it creates a transaction file in the current epoch"
    (is (= [{:meta {:open-epoch 1},
             :epochs {1 {:txfs #{"my-file"}}}}
            1
            ]
         (open-connection {:meta {:open-epoch 1}}
                          "my-file")))))

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
]
    (testing "available amt payer is -100"
      (is (= -100
             (get-available db payer))))
    (testing "available amt payee is 100"
      (is (= 100
             (get-available db payee))))
    (testing "consolidation steps"
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
          )))
    ))

(deftest ^:pending pending-tests
  (testing "that epoch cannot be closed if not all txfs are closed"))
