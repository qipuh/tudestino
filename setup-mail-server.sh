#!/bin/bash
# Script de configuración de servidor de correo para tudestino.lat
# Servidor: 161.132.38.151

set -e

echo "========================================="
echo "CONFIGURACIÓN DE SERVIDOR DE CORREO"
echo "Dominio: tudestino.lat"
echo "========================================="

DOMAIN="tudestino.lat"
HOSTNAME="mail.tudestino.lat"
DB_PASSWORD=$(cat /var/www/tudestino/apps/api/.env | grep DB_PASSWORD | cut -d'=' -f2)

# Configurar hostname
echo "Configurando hostname..."
hostnamectl set-hostname $HOSTNAME
echo "127.0.0.1 localhost $HOSTNAME" >> /etc/hosts
echo "161.132.38.151 $HOSTNAME $DOMAIN" >> /etc/hosts

# Crear base de datos para correos
echo "Creando base de datos para correos virtuales..."
mysql -u root -p"$DB_PASSWORD" << EOSQL
CREATE DATABASE IF NOT EXISTS mailserver CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE mailserver;

-- Tabla de dominios virtuales
CREATE TABLE IF NOT EXISTS virtual_domains (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de usuarios virtuales
CREATE TABLE IF NOT EXISTS virtual_users (
  id INT NOT NULL AUTO_INCREMENT,
  domain_id INT NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY email (email),
  FOREIGN KEY (domain_id) REFERENCES virtual_domains(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de alias virtuales
CREATE TABLE IF NOT EXISTS virtual_aliases (
  id INT NOT NULL AUTO_INCREMENT,
  domain_id INT NOT NULL,
  source VARCHAR(100) NOT NULL,
  destination VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (domain_id) REFERENCES virtual_domains(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertar dominio
INSERT INTO virtual_domains (name) VALUES ('$DOMAIN') ON DUPLICATE KEY UPDATE name=name;

-- Insertar usuarios con contraseñas encriptadas
INSERT INTO virtual_users (domain_id, password, email) VALUES
  (1, ENCRYPT('3@monitoSS', CONCAT('$6$', SUBSTRING(SHA(RAND()), -16))), 'echavez@$DOMAIN'),
  (1, ENCRYPT('3@gatituSS', CONCAT('$6$', SUBSTRING(SHA(RAND()), -16))), 'arojas@$DOMAIN'),
  (1, ENCRYPT('3@monitoSS', CONCAT('$6$', SUBSTRING(SHA(RAND()), -16))), 'soporte@$DOMAIN'),
  (1, ENCRYPT('3@monitoSS', CONCAT('$6$', SUBSTRING(SHA(RAND()), -16))), 'send@$DOMAIN')
ON DUPLICATE KEY UPDATE password=VALUES(password);

GRANT SELECT ON mailserver.* TO 'mailuser'@'localhost' IDENTIFIED BY 'mailpassword123';
FLUSH PRIVILEGES;
EOSQL

echo "Base de datos configurada."

# Configurar Postfix
echo "Configurando Postfix..."

# Main.cf
postconf -e "myhostname = $HOSTNAME"
postconf -e "mydomain = $DOMAIN"
postconf -e "myorigin = \$mydomain"
postconf -e "mydestination = localhost"
postconf -e "relayhost ="
postconf -e "mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128"
postconf -e "mailbox_size_limit = 0"
postconf -e "recipient_delimiter = +"
postconf -e "inet_interfaces = all"
postconf -e "inet_protocols = ipv4"
postconf -e "virtual_mailbox_domains = mysql:/etc/postfix/mysql-virtual-mailbox-domains.cf"
postconf -e "virtual_mailbox_maps = mysql:/etc/postfix/mysql-virtual-mailbox-maps.cf"
postconf -e "virtual_alias_maps = mysql:/etc/postfix/mysql-virtual-alias-maps.cf"
postconf -e "virtual_transport = lmtp:unix:private/dovecot-lmtp"
postconf -e "smtpd_tls_cert_file=/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
postconf -e "smtpd_tls_key_file=/etc/letsencrypt/live/$DOMAIN/privkey.pem"
postconf -e "smtpd_use_tls=yes"
postconf -e "smtpd_tls_auth_only = yes"
postconf -e "smtp_tls_security_level = may"
postconf -e "smtpd_sasl_type = dovecot"
postconf -e "smtpd_sasl_path = private/auth"
postconf -e "smtpd_sasl_auth_enable = yes"
postconf -e "smtpd_recipient_restrictions = permit_sasl_authenticated,permit_mynetworks,reject_unauth_destination"

# Configuración MySQL para Postfix
cat > /etc/postfix/mysql-virtual-mailbox-domains.cf << EOF
user = mailuser
password = mailpassword123
hosts = 127.0.0.1
dbname = mailserver
query = SELECT 1 FROM virtual_domains WHERE name='%s'
EOF

cat > /etc/postfix/mysql-virtual-mailbox-maps.cf << EOF
user = mailuser
password = mailpassword123
hosts = 127.0.0.1
dbname = mailserver
query = SELECT 1 FROM virtual_users WHERE email='%s'
EOF

cat > /etc/postfix/mysql-virtual-alias-maps.cf << EOF
user = mailuser
password = mailpassword123
hosts = 127.0.0.1
dbname = mailserver
query = SELECT destination FROM virtual_aliases WHERE source='%s'
EOF

chmod 640 /etc/postfix/mysql-*.cf
chgrp postfix /etc/postfix/mysql-*.cf

# Configurar master.cf para submission
postconf -M submission/inet="submission inet n - n - - smtpd"
postconf -P "submission/inet/syslog_name=postfix/submission"
postconf -P "submission/inet/smtpd_tls_security_level=encrypt"
postconf -P "submission/inet/smtpd_sasl_auth_enable=yes"
postconf -P "submission/inet/smtpd_recipient_restrictions=permit_sasl_authenticated,reject"

echo "Postfix configurado."

# Configurar Dovecot
echo "Configurando Dovecot..."

# Crear directorio de correo
mkdir -p /var/mail/vhosts/$DOMAIN
groupadd -g 5000 vmail 2>/dev/null || true
useradd -g vmail -u 5000 vmail -d /var/mail 2>/dev/null || true
chown -R vmail:vmail /var/mail

# Configurar 10-mail.conf
cat > /etc/dovecot/conf.d/10-mail.conf << EOF
mail_location = maildir:/var/mail/vhosts/%d/%n
namespace inbox {
  inbox = yes
}
mail_privileged_group = mail
protocol !indexer-worker {
}
first_valid_uid = 5000
last_valid_uid = 5000
first_valid_gid = 5000
last_valid_gid = 5000
mail_access_groups = vmail
EOF

# Configurar 10-auth.conf
sed -i 's/!include auth-system.conf.ext/#!include auth-system.conf.ext/' /etc/dovecot/conf.d/10-auth.conf
sed -i 's/#!include auth-sql.conf.ext/!include auth-sql.conf.ext/' /etc/dovecot/conf.d/10-auth.conf
sed -i 's/auth_mechanisms = plain/auth_mechanisms = plain login/' /etc/dovecot/conf.d/10-auth.conf

# Configurar dovecot-sql.conf.ext
cat > /etc/dovecot/dovecot-sql.conf.ext << EOF
driver = mysql
connect = host=127.0.0.1 dbname=mailserver user=mailuser password=mailpassword123
default_pass_scheme = SHA512-CRYPT
password_query = SELECT email as user, password FROM virtual_users WHERE email='%u';
user_query = SELECT 5000 AS uid, 5000 AS gid, '/var/mail/vhosts/%d/%n' AS home FROM virtual_users WHERE email='%u';
EOF

chmod 600 /etc/dovecot/dovecot-sql.conf.ext
chown vmail:vmail /etc/dovecot/dovecot-sql.conf.ext

# Configurar 10-master.conf
cat > /etc/dovecot/conf.d/10-master.conf << 'EOF'
service imap-login {
  inet_listener imap {
    port = 143
  }
  inet_listener imaps {
    port = 993
    ssl = yes
  }
}

service lmtp {
  unix_listener /var/spool/postfix/private/dovecot-lmtp {
    mode = 0600
    user = postfix
    group = postfix
  }
}

service auth {
  unix_listener /var/spool/postfix/private/auth {
    mode = 0666
    user = postfix
    group = postfix
  }
  unix_listener auth-userdb {
    mode = 0600
    user = vmail
    group = vmail
  }
  user = dovecot
}

service auth-worker {
  user = vmail
}
EOF

# Configurar SSL en Dovecot
cat > /etc/dovecot/conf.d/10-ssl.conf << EOF
ssl = required
ssl_cert = </etc/letsencrypt/live/$DOMAIN/fullchain.pem
ssl_key = </etc/letsencrypt/live/$DOMAIN/privkey.pem
ssl_prefer_server_ciphers = yes
ssl_min_protocol = TLSv1.2
EOF

echo "Dovecot configurado."

# Reiniciar servicios
echo "Reiniciando servicios..."
systemctl restart postfix
systemctl restart dovecot
systemctl enable postfix
systemctl enable dovecot

echo ""
echo "========================================="
echo "CONFIGURACIÓN COMPLETADA"
echo "========================================="
echo ""
echo "Cuentas de correo creadas:"
echo "  - echavez@$DOMAIN (contraseña: 3@monitoSS)"
echo "  - arojas@$DOMAIN (contraseña: 3@gatituSS)"
echo "  - soporte@$DOMAIN (contraseña: 3@monitoSS)"
echo "  - send@$DOMAIN (contraseña: 3@monitoSS)"
echo ""
echo "Configuración SMTP para la aplicación:"
echo "  SMTP_HOST=mail.tudestino.lat"
echo "  SMTP_PORT=587"
echo "  SMTP_USER=send@tudestino.lat"
echo "  SMTP_PASS=3@monitoSS"
echo ""
echo "IMPORTANTE: Debes configurar estos registros DNS en Cloudflare:"
echo ""
echo "  Tipo: A"
echo "  Nombre: mail"
echo "  Valor: 161.132.38.151"
echo ""
echo "  Tipo: MX"
echo "  Nombre: @"
echo "  Valor: mail.tudestino.lat"
echo "  Prioridad: 10"
echo ""
echo "  Tipo: TXT"
echo "  Nombre: @"
echo "  Valor: v=spf1 mx ~all"
echo ""
echo "========================================="
