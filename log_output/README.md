Create the cluster and make app available via ingress:

```bash
k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2
docker exec k3d-k3s-default-agent-0 mkdir -p /tmp/kube
kubectl apply -R -f manifests
```

Then access the pingpong app in http://localhost:8081/pingpong
and access the pingpong request count in http://localhost:8081
