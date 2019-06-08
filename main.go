package main

import (
	"net/http"
	// "encoding/json"
	"io/ioutil"
	// "os"
	"fmt"
	// "strings"
)

func getWordsHandler(w http.ResponseWriter, r * http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write(readWords())
}

func newWordHandler(w http.ResponseWriter, r * http.Request) {
	if r.Method == "POST" {
		fmt.Println(r.Body)
		r.ParseForm()
		fmt.Println(r.Form)

		// for k, v := range r.Form {
		// 	key := k
		// 	val := v
		// 	// fmt.Printf("key: %v", strings.Join(k[1:]))
		// 	// fmt.Printf("val: %v", val)
		// }

		http.Redirect(w, r, "http://localhost:3000", http.StatusSeeOther)
	}
}

func readWords() []byte {
	jsonData, err := ioutil.ReadFile("words.json")
	if err != nil {
		panic(err)
	}

	return jsonData
}

func main() {

	http.HandleFunc("/getWords", getWordsHandler)
	http.HandleFunc("/newWord", newWordHandler)
	http.Handle("/", http.FileServer(http.Dir("public")))

	http.ListenAndServe(":3000", nil)
}