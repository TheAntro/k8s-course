Create the cluster, enable Gateway API, create namespace and db secret, apply manifests, and get the Gateway url:

```bash
gcloud container clusters create dwk-cluster --zone=europe-north1-b --cluster-version=1.32 --disk-size=32 --num-nodes=3 --machine-type=e2-micro
gcloud container clusters update dwk-cluster --location=europe-north1-b --gateway-api=standard
kubectl create namespace exercises
kubens exercises
kubectl create secret generic pingpong-db-secret --from-literal=POSTGRES_PASSWORD='<insert-password-here>' -n exercises
kubectl apply -R -f manifests
kubectl get gateway --watch
```

Then access the pingpong app in http://<ingress-address-here>/pingpong
The access the log output app in http://<ingress-address-here>/
