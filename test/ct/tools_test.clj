(ns ct.tools-test
  (:require [clojure.test :refer [deftest testing is]]
            [ct.tools :refer :all]))

(deftest merge-deep-test
  (testing "simple non-overlapping keys"
    (is (= {:a 1 :b 2}
           (merge-deep {:a 1} {:b 2}))))
  (testing "deeper merge"
    (is (= {:a {:x 1 :y 2}}
           (merge-deep {:a {:x 1}} {:a {:y 2}}))))
  (testing "merge with nil right"
    (is (= {:a 1}
           (merge-deep {:a 1} nil))))
  (testing "merge with nil left"
    (is (= {:a 1}
           (merge-deep nil {:a 1}))))
  (testing "merge multiples"
    (is (= {:a 1, :b 2, :c 3}
           (merge-deep {:a 1} {:b 2} {:c 3}))))
  )
