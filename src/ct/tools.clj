(ns ct.tools)

; standard tools that are not worth pushing into a lib by themselves

(defn dissoc-in
  "removes one leave out of a map tree"
  [m ks]
  (case (count ks)
        0 nil
        1 (dissoc m (first ks))
        (update-in m (drop-last ks) #(dissoc % (last ks)))))
