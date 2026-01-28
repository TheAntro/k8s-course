FROM google/cloud-sdk:slim

# Complicated setup needed to prevent postgres version mismatch between backup worker and the database.
RUN apt-get update && apt-get install -y gnupg curl

RUN curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/keyrings/postgresql.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/postgresql.gpg] http://apt.postgresql.org/pub/repos/apt/ bookworm-pgdg main" > /etc/apt/sources.list.d/pgdg.list

RUN apt-get update && apt-get install -y postgresql-client-17 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /scripts
COPY backup.sh .
RUN chmod +x backup.sh

ENTRYPOINT ["/scripts/backup.sh"]