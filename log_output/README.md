To run, create a k3d cluster and deploy the app:

```bash
k3d cluster create -a 2
kubectl create deployment hashgenerator-dep --image=waltherbeach/dwk-app1
```
