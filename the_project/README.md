Create the cluster, namespace, volume and make app available

```bash
k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2
kubectl create namespace project
docker exec k3d-k3s-default-agent-0 mkdir -p /tmp/kube
kubectl apply -R -f manifests
```

Then access the app in http://localhost:8081
