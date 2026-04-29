package middleware

import (
	"net"
	"net/http"
	"sync"
	"time"

	"github.com/Blue-Onion/RestApi-Go/handler"
)

var (
	ipInfo  = make(map[string][]time.Time)
	mu      sync.Mutex
	maxRate = 5
	gapTime = 10 * time.Second
)

func getIPAddr(r *http.Request) string {
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return ip
}
func MiddlewareRateLimit(next http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ip := getIPAddr(r)
		mu.Lock()
		defer mu.Unlock()
		value := ipInfo[ip]

		now := time.Now()

		var filter []time.Time
		for _, t := range value {
			if now.Sub(t) < gapTime {
				filter = append(filter, t)

			}
		}
		if len(filter) >= maxRate {
			handler.RespondWithError(w, http.StatusTooManyRequests, "Too Many Req")
			return
		}
		filter = append(filter, time.Now())
		ipInfo[ip] = filter
		next.ServeHTTP(w, r)
	}
}
