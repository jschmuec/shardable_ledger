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
            [ct.main :refer :all]
))

(st/instrument)

(deftest connection-test
  (testing "that it creates a transaction file in the current epoch"
    (is (=
         {:epochs {"e-0" {:txfs {"my-file" 1}}}}
         (open-connection {:epochs {"e-0" {}}} "my-file")))))

(deftest full-transaction-test
  (let [tf "test-file"
        tx-id "tx-1"
        payer "payer"
        payee "payee"
        db (open-connection {} tf)
        db (add-doc-to-tx db tf tx-id payer)
        db (advise db tf tx-id payer -100)
        db (add-doc-to-tx db tf tx-id payee)
        db (advise db tf tx-id payee 100)]
    (testing "available amt payer is -100"
      (is (= -100
             (get-available db payer))))
    (testing "available amt payee is 100"
      (is (= 100
             (get-available db payee))))
    ))




