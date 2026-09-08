import os, sys, paramiko

# 强制 UTF-8 输出
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if sys.stderr.encoding and sys.stderr.encoding.lower() != 'utf-8':
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

HOST = os.environ.get('SSH_HOST', '8.152.3.67')
USER = os.environ.get('SSH_USER', 'root')
PASS = os.environ.get('SSH_PASS', '')
KEY = os.path.expanduser('~/.ssh/id_ed25519')

def get_client():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        key = paramiko.Ed25519Key.from_private_key_file(KEY)
        client.connect(HOST, port=22, username=USER, pkey=key, timeout=60,
                       banner_timeout=60, auth_timeout=60)
        print('[auth] key', file=sys.stderr)
    except Exception:
        client.connect(HOST, port=22, username=USER, password=PASS, timeout=60,
                       banner_timeout=60, auth_timeout=60)
        print('[auth] password', file=sys.stderr)
    return client

def run_script(local_path):
    with open(local_path, 'r', encoding='utf-8') as f:
        content = f.read()
    client = get_client()
    try:
        sftp = client.open_sftp()
        remote = '/root/deploy-script.sh'
        with sftp.open(remote, 'w') as rf:
            rf.write(content)
        sftp.chmod(remote, 0o755)
        sftp.close()
        stdin, stdout, stderr = client.exec_command(f'bash {remote} 2>&1', timeout=3600, get_pty=True)
        for line in iter(stdout.readline, ''):
            sys.stdout.write(line)
            sys.stdout.flush()
        return stdout.channel.recv_exit_status()
    finally:
        client.close()

def run_cmd(cmd):
    client = get_client()
    try:
        stdin, stdout, stderr = client.exec_command(cmd, timeout=600, get_pty=True)
        out = stdout.read().decode('utf-8', errors='replace')
        err = stderr.read().decode('utf-8', errors='replace')
        if out:
            sys.stdout.write(out)
        if err:
            sys.stderr.write(err)
        return stdout.channel.recv_exit_status()
    finally:
        client.close()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('用法: python ssh-run.py "命令" | --script 脚本路径')
        sys.exit(1)
    if sys.argv[1] == '--script':
        sys.exit(run_script(sys.argv[2]))
    else:
        sys.exit(run_cmd(' '.join(sys.argv[1:])))
