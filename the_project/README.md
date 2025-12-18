Deploy the app and make it accessible via port forwarding:

```bash
kubectl apply -f manifests
kubectl port-forward <pod-name> 3003:3001
```

Then access the app in http://localhost:3003
