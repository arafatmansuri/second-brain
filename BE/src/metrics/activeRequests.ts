import {Gauge} from "prom-client";

export const activeRequestsGauge = new Gauge({
  name: "active_requests",
  help: "Number of active requests",
});
