import os, sys, paramiko

HOST = os.environ.get('SSH_HOST', '8.152.3.67')
USER = os.environ.get('SSH_USER', 'root')
PASS = os.environ.get('SSH_PASS', '')
KEY = os.path.expanduser('~/.ssh/id_ed25519')

if len(sys.argv) < 3:
    print('用法: python sftp-upload.py <本地文件> <远程路径>')
    sys.exit(1)

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    try:
        key = paramiko.Ed25519Key.from_private_key_file(KEY)
        client.connect(HOST, port=22, username=USER, pkey=key, timeout=30)
    except Exception:
        client.connect(HOST, port=22, username=USER, password=PASS, timeout=30)
    sftp = client.open_sftp()
    sftp.put(sys.argv[1], sys.argv[2])
    sftp.close()
    print(f'[OK] uploaded {os.path.getsize(sys.argv[1])} bytes')
finally:
    client.close()
