(ns ct.txf-test
  (:require [clojure.test :refer [deftest testing is]]
            [clojure.spec.test.alpha :as st]
            [ct.txf :refer :all]
            [ct.epoch :as epoch])
  )

(st/instrument)

(deftest add-doc-test
  (testing "that the doc has been added"
    (is (= {"tx-1" {:docs #{"doc"}}}
           (add-doc {} "tx-1" "doc"))))
  (testing "that it fails if txf is closed"
    (is (thrown? AssertionError
                 (add-doc {:closed true} "tx-1" "doc"))))
  (testing "that it fails if the transaction has been closed."
    (is (thrown? AssertionError
                 (add-doc {"tx-1" {:closed true}} "tx-1" "doc")))))


(deftest close-tx-test
  (testing "that close-tx does close the tx"
    (is (tx-closed? (close-tx {"tx-1" {:docs #{"doc"}}} "tx-1")
                    "tx-1"))))

(deftest close-txf-test
  (testing "that the doc is closed after close-txf"
    (is (not (txf-open? (close-txf {"tx-1" {:docs #{"doc"}}}))))))






