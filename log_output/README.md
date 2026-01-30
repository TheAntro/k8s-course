A query to get the number of pods created by StatefulSets in the prometheus namespace:
`count(kube_pod_info{namespace="prometheus", created_by_kind="StatefulSet"})`

Create the cluster, namespace and secret, apply manifests:

```bash
k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2
kubectl create namespace exercises
kubens exercises
kubectl create secret generic pingpong-db-secret --from-literal=POSTGRES_PASSWORD='<insert-password-here>' -n exercises
kubectl apply -R -f manifests/pingpong
kubectl apply -R -f manifests/hashgenerator
kubectl apply -R -f manifests/shared
# At this stage, apps' Status are Running but that they are not Ready.
kubectl apply -R -f manifests/final
# The apps' become ready after adding the database.
```

Then access the pingpong app in http://<ingress-address-here>/pingpong
The access the log output app in http://<ingress-address-here>/
