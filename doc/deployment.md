## Deployment

We use the [included](charts/openstad-headless) [Helm](https://helm.sh/) chart to deploy to our own test cluster. The 
deployment is described via the scripts located in the `operations/deployments/openstad-headless` directory. For each 
environment we created a single deploy script. For example to the deploy to acc you would run the 
`./operations/deployments/openstad-headless/deploy-acc.sh` script. This automatically decrypts the secret values 
located in the repository using SOPS.

### Requirements

- [SOPS](https://github.com/getsops/sops) is installed
- [Helm](https://helm.sh/) is installed
- You have access to the `headless.agekey` private key
- You have access to and configured the context used in the deployment script.

### Adding secrets

> **NOTE**: Export the location of the agekey file in a variable called `SOPS_AGE_KEY_FILE`

Adding new secrets to the Helm deployment can be done by using the utilities scripts [`decrypt.sh`]((operations/scripts/decrypt.sh)) and [`encrypt.sh`](operations/scripts/encrypt.sh).

To decrypt all secrets ending with `.enc.yml` you can run the following command:
```sh
$ ./operations/scripts/decrypt.sh
```

To decrypt a single file you can run the following command:
```sh
$ ./operations/scripts/decrypt.sh /path/to/secret.enc.yml
```
This places a decrypted `yml` next to the encrypted file. Make sure to not commit this unecrypted file to git. To avoid 
this issue make sure to store secrets in a file called `secrets.yml`.

To encrypt a yml file you can run the `encrypt.sh` script. This creates a `$filename.enc.yml` file next to the 
unencrypted file. Make sure to decrypt the original file first to avoid overriding values. Call the encrypt script with the file to encrypt.
```sh
$ ./operations/scripts/encrypt.sh operations/deployments/openstad-headless/environments/acc/secrets/secrets.yml
```

### Using deployment scripts
Run the deployment script for the specific environment, for example acc:
```sh
$ ./operations/deployments/openstad-headless/deploy-acc.sh
```

### Customizing deployments
Every deployment has their own `yml` files with their own config. This can be customized per environment. In the root of
every deployment an environments folder is created with the following structure:

```
└── environments
    └── acc                     # Environment name
        ├── images.yml          # Target images to deploy
        ├── secrets
        │   ├── secrets.enc.yml # Encrypted yml containing secret values for deployment
        │   └── secrets.yml     # Unencrypted yml containing secrets. Not in git
        └── values.yml          # Custom values for Helm deployment (plain text)
```

These files get called in custom deployment scripts like `deploy-acc.sh`. These scripts configure the correct kubernetes 
context, configure deployment namespace, decrypts files, combines multiple value files and runs the helm command to
install or upgrade release.

If you want to create a new environment you can copy the deployment script (`deploy-acc.sh`) and change the configuration 
in the script itself. This allows other users to also deploy to that environment by simply running the script.
