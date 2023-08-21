(ns ct.epoch
  (:require 
   [clojure.spec.alpha :as s]
   [clojure.spec.test.alpha :as st]
   )
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

(defn add-txf
  "adds a transaction file to an epoch"
  [epoch txf]
  (assoc-in epoch [:txfs txf] 1 )
  )

(comment
  (st/instrument)
  (consolidate {:state :closed})
  (consolidate {:state :open}) ;; fails
;;
)
