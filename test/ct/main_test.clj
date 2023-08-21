(ns ct.main-test
  (:require [clojure.test :refer [deftest testing is] :as ct]
            [clojure.spec.alpha :as s]
            [clojure.test.check :as tc]
            [clojure.test.check.generators :as tcg]
            [clojure.test.check.clojure-test :refer [defspec]]
            [clojure.test.check.properties :as tcp]
            [com.gfredericks.test.chuck.clojure-test :refer [for-all checking]]
            [clojure.spec.gen.alpha :as gen]
            [clojure.spec.test.alpha :as st]
            [com.gfredericks.test.chuck :as chuck]
            [ct.acct :as acct]
            [ct.epoch :as epoch]
))

(defn update-doc
  "updates a document in the database"
  [db col doc-id f & args]
  (apply update-in db [col doc-id] f args))

(defn open-connection
  [db connection file-name]
   (let [last-epoch (-> db :epochs last key)]
     (update-doc db :epochs last-epoch epoch/add-txf file-name))
  )

(deftest connection-test
  (testing "that it creates a transaction file in the current epoch"
    (is (=
         {:epochs {"e-0" {:txfs {"my-file" 1}}}}
         (open-connection {:epochs {"e-0" {}}} "me" "my-file")))))
