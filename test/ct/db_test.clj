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

(defn test-db
  "function that tests if a db works correctly

  takes a function that creates a clean db and one that closes it (or empties it)"
  [init-db-f
   close-db-f]
  (testing "Update doc updates the doc in a map database"
    (is (= 
         43
         #dbg
         (-> (init-db-f)
             (set-doc :coll :doc 43)
             (get-doc :coll :doc))
         ))))

(deftest map-db-generic-test
  (test-db (fn [] {}) (fn [])))
