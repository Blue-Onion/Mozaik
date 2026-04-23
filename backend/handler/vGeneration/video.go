package vgeneration

import (
	"fmt"
	"net/http"
	"os/exec"

	"github.com/Blue-Onion/RestApi-Go/handler"
)

func generateVideo() {
	cmd := exec.Command("python3", "python/code.py")
	stdout, err := cmd.Output()
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println(string(stdout))
}

func HandleVideoGeneration(w http.ResponseWriter, r *http.Request) {
	generateVideo()
	handler.RespondWithJson(w, 200, map[string]string{
		"Message": "LogOut Successfully",
	})
}
func getFile() {

}
