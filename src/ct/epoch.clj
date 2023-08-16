(ns ct.epoch
  (:require 
   [clojure.spec.alpha :as s]
   [clojure.spec.test.alpha :as st]
   )
  )

(defn flag-tx-as-processed
  [epoch tx-id] 

  (if-let [tx-value (get (:pending epoch) tx-id)]
          (-> epoch
              (dissoc :pending tx-id)
              (assoc-in [:processed tx-id] tx-value))
          epoch)
  )

(defn transition
  [from to epoch]
  (assoc epoch :state to))

(s/fdef transition
  :args (s/and (s/cat :from any? :to any? :epoch map?)
               #(= (:from %) (:state (:epoch %))))
  )

(defn close
  [e]
  (transition :open :closed e))

(defn consolidate
  [e]
  (transition :closed :consolidated e))

(comment
  (st/instrument)
  (consolidate {:state :closed})
  (consolidate {:state :open}) ;; fails
;;
)
