(ns ct.txf
  (:require [clojure.spec.alpha :as s]))



(defn txf-open?
  [txf]
  (not (:closed txf)))

(defn tx-open?
  [txf tx]
  (-> txf
      (get tx)
      :closed
      not))

(comment
  (tx-open?
   {"tx-1" {:closed true}} "tx-1")
)

(s/def ::txf-closed any?)
(s/def ::txf-docs set?)
(s/def ::txf
  (s/keys :opt-un [::txf-closed ::txf-docs]))

(do
  (defn add-docs
    [txf tx docs]
    {:pre [(txf-open? txf)
           (tx-open? txf tx)]}
    (update-in txf [tx :docs] #(into #{} (concat % docs))))

  (s/fdef add-docs
    :args  (s/cat :txf ::txf-doc :tx any? :docs seq?)))

(defn add-doc
  [txf tx doc]
  (add-docs txf tx [doc]))

(defn tx-closed?
  [txf tx]
  (get-in txf [tx :closed]))

(defn close-tx
  [txf tx]
  (assoc-in txf [tx :closed] true))

(defn close-txf
  [txf]
  (assoc txf :closed true))
