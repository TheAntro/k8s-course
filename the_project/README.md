# Image of Logs Explorer when uploading a new todo

<img width="1403" height="664" alt="Screenshot 2026-01-28 at 21 17 55" src="https://github.com/user-attachments/assets/daa07b49-5604-4de9-b4f5-8363ced1b511" />

# Cloud SQL vs Postgres in GKE

In effect, the choice between using the managed Cloud SQL vs. a self-managed Postgres instance comes down to whether the cost savings from the self-managed solution are substantial enough to justify the time investment (i.e., also cost) needed to setup and manage the solution.

## Direct infrastructure costs

Let's look at a simplified cost calculation for each option in the europe-north1 region:

A Cloud SQL of type db-standard-2 with 2 vCPUs, 7.5 GiB of memory, and 100 GiB of SSD storage costs 98.10€ per month.

A Compute Engine instance of type n2-standard-2 with 2 vCPUs, 8 GiB of memory costs 67.81€. 100 GiB of zonal SSD persistent disk storage costs 15.87€. So in total 83.68€ per month.

Thus a 15% cost saving margin is pretty much the maximum one could achieve from opting for the self-managed Postgres option. In reality, this is most likely a little bit lower, since there are fees for the GKE cluster itself, and Cloud SQL provides e.g. backup options that would have to be handled with some mechanism. There are costs for the storage of the Cloud SQL backups also, so for storing the backup files, the difference is probably small.

## Setup effort

Cloud SQL provides a straightforward setup experience through configurable backups, high-availability setup with a simple switch etc. Cloud SQL also provides features such as Cloud SQL studio, which allows users with authorized access to query the database from Google Cloud Console UI.

For the self-managed option on the other hand, backup management and handling and high-availability if needed have to be setup yourself, which is high effort if only a single database instance is setup, but most likely becomes relatively less effort for later instances since the setup can be done the same way. Also with Cloud SQL, the resources are not defined in your manifestation yamls, so that could be an increased complexity for some setups and teams.

## Maintenance effort

Cloud SQL is a managed service, meaning that Google Cloud takes care of maintaining the Postgres instance while the user only needs to care about handling the database. This means that ongoing work related to OS and image patching is moved from the developer to Google. Also documentation and systems for backups and point-in-time recovery are provided packaged in, which could mean a lower maintenance effort since the storage and jobs for these do not have to be maintained.

## Summary

Overall, the cost difference of 15% can be significant at high enough scale. However, the simplicity of using a managed Cloud SQL frees developer resources that would otherwise be eaten up by maintenance chores and high-stakes and thus high-stress database instance setup and management. At lower scale, for example a web app that has a single database that costs a few hunder euros a month, the developer resource saved is almost certainly higher than the cost increase from the Cloud SQL. For some teams with for example personnel for database administration, it could be easier to get cost savings from doing the management, and the increased control over how the database itself, backups, compute, networking and availability are setup might be even a benefit compared to the managed service that obviously will have some limitations.

---

These are mostly for reference for how to deploy from local machine. After `gcloud` commands, this is all handled by the Github Actions workflow. Finally there is a way to test for the exercise 4.2 readiness probes

```bash
gcloud container clusters create dwk-cluster --zone=europe-north1-b --cluster-version=1.32 --disk-size=32 --num-nodes=3 --machine-type=e2-medium
gcloud container clusters update dwk-cluster --location=europe-north1-b --gateway-api=standard
gcloud container clusters update dwk-cluster --zone europe-north1-b --workload-pool=<PROJECT_ID>.svc.id.goog
kubectl create namespace project
kubens project
kubectl create secret generic todo-db-secret --from-literal=POSTGRES_PASSWORD='<insert-password-here>' -n project
kubectl apply -k manifests
kubectl get gateway --watch
# Break db connection by changing the DB_NAME for todo-backend to see readiness probe in effect
kubectl -n project set env deployment/todo-backend-dep DB_NAME=wrong_db_name
```

Then access the app in http://<gateway-address>
