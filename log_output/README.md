Create the cluster, namespace, volume dir and apply manifests:

```bash
k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2
kubectl create namespace exercises
kubens exercises
kubectl create secret generic pingpong-db-secret --from-literal=POSTGRES_PASSWORD='<insert-password-here>' -n exercises
kubectl apply -R -f manifests
```

Then access the pingpong app in http://localhost:8081/pingpong
and access the pingpong request count in http://localhost:8081
