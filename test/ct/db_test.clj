(ns ct.db-test
  (:require [clojure.test :refer [deftest testing is]]
            [clojure.spec.test.alpha :as st]
            [ct.db :refer :all]
            ))

(st/instrument)

(deftest map-db-test
  (testing "That the multi method routes to the clojure dict-based db"
    (testing "Update doc updates the doc in a map database"
      (is (= 
           {:coll {:doc 43}}
           (update-doc {:coll {:doc 42}} :coll :doc #(+ 1 %))
           )))
    (testing "process-doc"
      (is (=
           [{:coll {:doc 43}}, 43]
           (process-doc {:coll {:doc 42}} :coll :doc #(+ 1 %)))))
    (testing "get-doc"
      (is (=
           43
           (get-doc {:coll {:doc 43}} :coll :doc))))))
