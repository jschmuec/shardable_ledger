(ns ct.tools)

; standard tools that are not worth pushing into a lib by themselves

(defn dissoc-in
  "removes one leave out of a map tree"
  [m ks]
  (case (count ks)
        0 nil
        1 (dissoc m (first ks))
        (update-in m (drop-last ks) #(dissoc % (last ks)))))

(defn merge-deep 
  ([m] m)
  ([m n]
   (cond
     (not (seq m)) n
     (not (seq n)) m
     true (loop [[k & ks] (keys n)
                 m m]
            (let [merged (assoc m k (merge-deep (get m k) (get n k)))]
              (if (seq ks)
                (recur ks merged)
                merged))
            )))
  ([m n & ns] 
   (loop [m m
          n n
          ns ns]
     (let [md (merge-deep m n)]
       (if (seq ns)
         (recur md (first ns) (rest ns))
         md)
       )))
  )


