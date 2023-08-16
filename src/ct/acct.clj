(ns ct.acct
  (:require
   [clojure.spec.alpha :as s]
   [clojure.spec.test.alpha :as st]
   [ct.tools :refer [dissoc-in]]
   ))

;; contains functions that operate on the documents

(s/def ::acct map?)

(do
  (defn available-amt
    "calculates the available balance on an account, i.e. the net of balance and reservations"
    [acct-doc]
    (reduce + (:value acct-doc) 
            (-> acct-doc
                :pending
                vals
                )))

  (s/fdef available-amt)

  (def calculate-pending available-amt) ;; backwards compatibility
  )

(comment 
  (calculate-pending 
   {:value 100 :pending {:1 50}})
)

(do 
  (defn create-epoch 
    "creates epoch on a document by copying the latest epoch"
    [doc epoch]
    (cond
      (get doc epoch) doc
      (first doc) (assoc doc epoch (first (vals doc)))
      :true (assoc {} epoch {})))
  
  (s/fdef create-epoch
    :args (s/cat :doc map? :epoch any?))
)

(defn update-acct-if-pending
  "udpates the balance and state of a pending tx-id. nop if tx-id is not pending "
  [acct epoch tx-id]
  (if-let [tx-value (get-in acct [epoch :pending tx-id])]
    (-> acct 
        (dissoc-in [epoch :pending tx-id])
        (assoc-in [epoch :processed tx-id] tx-value)
        (update-in [epoch :value] + tx-value))
    acct)
  )

(defn update-acct-balance
  [acct epoch tx-id]
  (-> acct
      (create-epoch epoch)
      (update-acct-if-pending epoch tx-id)
))
