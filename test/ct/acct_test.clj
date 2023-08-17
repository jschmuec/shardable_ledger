(ns ct.acct-test
  (:require [clojure.test :refer [deftest testing is]]

            [ct.acct :as acct]))

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


(defn consolidate
  [acct epoch tx]
  (let [last-balance (or (get-in acct [:vs epoch]) 0)]
    (if-let [amt (get-in acct [:pending tx])]
      (-> acct
          (assoc-in [:value epoch] (+ last-balance amt))
          (update :pending #(dissoc % tx)))
      acct))
  )

(consolidate after-reservation "e1"  "tx-1")

(deftest consolidate-test
  (testing "consolidating a single transaction"
    (is (= -100
           (->
               (consolidate after-reservation "e1" "tx-1")
               (acct/available-amt)
               )))))

(deftest available-amt-test
  (testing "available amt after an initial reservation"
    (is 
     (=
      -100
      (acct/available-amt after-reservation))))

  (let [after-consolidation {:values {"e-0" 100}}]
   )  

)
