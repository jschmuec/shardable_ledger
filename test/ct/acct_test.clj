(ns ct.acct-test
  (:require [clojure.test :refer [deftest testing is]]
            [clojure.spec.test.alpha :as st]
            [ct.acct :as acct]))

(st/instrument)

(def after-reservation
  {:vs {"e-0" 0}
   :pending {"tx-1" -100}})

(defn apply-if
  [val p? f]
  (if-let [var (p? val)]
    (f val)
    val))

(defn apply-if-not
  [val p? f]
  (apply-if val (comp not p?) f))

(deftest apply-if-test
  (testing "applies transformation if predicates is true"
    (is (= :result
           (apply-if 1 odd? (fn [x] :result)))))
  (testing "does not apply transformation if predicate is false"
    (is (= 1
           (apply-if 1 even? (fn [x] :result))))))

(deftest apply-if-not-test
  (testing "applies transformation if predicates is false"
    (is (= :result
           (apply-if-not 1 even? (fn [x] :result)))))
  (testing "does not apply transformation if predicate is true"
    (is (= 1
           (apply-if-not 1 odd? (fn [x] :result))))))


(def after-consolidation
   {:vs {"e-0" 0 "e1" -100}
            :pending {}})

(deftest after-consolidation-test
  (testing "available balance is -100"
    (is (= -100
           (acct/available-amt after-consolidation)))))

(deftest consolidate-test
  (testing "consolidating a single static transaction"
    (is (=
         after-consolidation
         (acct/consolidate after-reservation "e1" "tx-1")
         )))
  (testing "consolidate a second transaction without affecting the first"
    (is (=
         {:vs {"e0" 100} :pending {"tx-2" -1000}}
         (acct/consolidate
          {:pending {"tx-1" 100, "tx-2" -1000}}
          "e0"
          "tx-1"))))


  (testing "consolidating is idempotent"
    (is (=
         {:vs {"e0" 100} :pending {"tx-2" -1000}}
         (acct/consolidate {:vs {"e0" 100} :pending {"tx-2" -1000}} "e0" "tx-1")))))

(deftest available-amt-test
  (testing "available amt after an initial reservation"
    (is 
     (=
      -100
      (acct/available-amt after-reservation))))
)

(deftest balance-test
  (testing "balance with existing epoch is correct"
    (is 
     (= 1
        (acct/balance {:vs {"e-0" 1}} "e-0"))))
  (testing "balance for non-existing epoch is nil"
    (is (= nil
           (acct/balance {:vs {"e-0" 1}} "e-1")))))

(deftest advise-test
  (testing "available amt changed after advise"
    (is (=
         1100
         (acct/available-amt 
          (acct/advise {:vs {"e0" 0} :pending {"some tx" 1000}} "tx-1" 100))))))
