(ns ct.epoch
  (:require 
   [clojure.spec.alpha :as s]
   [clojure.spec.test.alpha :as st]
   )
  )

(defn close
  [e]
  (assoc e :closed true))

(defn consolidate
  [e]
  (assoc e :consolidated true))

(defn add-txf
  "adds a transaction file to an epoch"
  [epoch txf]
  (update epoch :txfs #(if % (conj % txf) #{txf} )
          )
  )

(defn get-open-epoch
  "returns an open epoch from meta-data"
  [meta-epochs]
  1)

(comment
  (st/instrument)
  (consolidate {:state :closed})
  (consolidate {:state :open}) ;; fails
;;
)
