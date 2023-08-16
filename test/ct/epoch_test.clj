(ns ct.epoch-test
  (:require [clojure.test :refer [deftest testing is]]

            [ct.epoch :as epoch])
  )

(deftest flag-tx-as-processed-test
  (testing "mvoes tx from pending to processed"
    (is (=  {:processed {"tx-1" ["acct1" "acct2"]}}
            (epoch/flag-tx-as-processed 
             {:pending {"tx-1" ["acct1" "acct2"]}}
             "tx-1")
            )))
  (testing "does nothing if tx is not pending"
    (is (= {:pending {"tx-1" ["acct1" "acct2"]}}
           (epoch/flag-tx-as-processed
             {:pending {"tx-1" ["acct1" "acct2"]}}
             "tx-2"
            )))))

