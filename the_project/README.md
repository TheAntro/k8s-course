In this exercise, the [github action](https://github.com/TheAntro/k8s-course/tree/3.8/.github/workflows) is handling the deployment and the clean up (after gateway-api has been activated).
These are for reference for how to deploy from local machine.
Create the cluster, namespace, volume and make app available

```bash
gcloud container clusters create dwk-cluster --zone=europe-north1-b --cluster-version=1.32 --disk-size=32 --num-nodes=3 --machine-type=e2-micro
gcloud container clusters update dwk-cluster --location=europe-north1-b --gateway-api=standard
kubectl create namespace project
kubens project
kubectl create secret generic todo-db-secret --from-literal=POSTGRES_PASSWORD='<insert-password-here>' -n project
kubectl apply -k manifests
kubectl get gateway --watch
```

Then access the app in http://<gateway-address>
