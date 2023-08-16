(ns ct.acct-test
  (:require [clojure.test :refer [deftest testing is]]

            [ct.acct :as acct]))

(deftest create-epoch-test
  (testing "returns the doc unchanged if epoch exists"
    (is (= {:e0 "xxx"}
           (acct/create-epoch {:e0 "xxx"} :e0))))
  (testing "returns the doc with the last epoch updated"
    (is (= {:e0 "value from epoch 0"
            :e1 "value from epoch 0"}
           (acct/create-epoch {:e0 "value from epoch 0"} :e1)))))

(deftest update-acct-if-pending-test
  (testing "value is correct updated if tx is pending"
    (is (=
         {:e0 {:value 150 :processed {:tx1 50} :pending {}}}
         (acct/update-acct-if-pending {:e0 {:value 100 :pending {:tx1 50}}} :e0 :tx1)
         ))))

(deftest test-update-balance
  (testing "that tx-1 is processed on acct"
    (is (= {"e-1" {:value 200 :pending {} :processed {"tx-1" 100}}}
           (acct/update-acct-balance  {"e-1" {:value 100 :pending {"tx-1" 100}}} "e-1" "tx-1")))))
