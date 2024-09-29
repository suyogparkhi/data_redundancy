import sys
import os
from datasketch import MinHash, MinHashLSH

def create_minhash(content):
    minhash = MinHash(num_perm=128)
    for i in range(0, len(content), 4):
        minhash.update(content[i:i+4])
    return minhash

def scan_folders(source_folder, target_folder):
    lsh = MinHashLSH(threshold=0.5, num_perm=128)
    
    # Index source files
    for root, _, files in os.walk(source_folder):
        for file in files:
            file_path = os.path.join(root, file)
            with open(file_path, 'rb') as f:
                content = f.read()
            minhash = create_minhash(content)
            lsh.insert(file_path, minhash)
    
    # Scan target files for redundancies
    redundancies = []
    for root, _, files in os.walk(target_folder):
        for file in files:
            file_path = os.path.join(root, file)
            with open(file_path, 'rb') as f:
                content = f.read()
            minhash = create_minhash(content)
            similar_files = lsh.query(minhash)
            if similar_files:
                redundancies.append((file_path, similar_files))
    
    return redundancies

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python backend.py <source_folder> <target_folder>")
        sys.exit(1)

    source_folder = sys.argv[1]
    target_folder = sys.argv[2]
    
    redundancies = scan_folders(source_folder, target_folder)
    
    if redundancies:
        print("Redundancies found:")
        for target_file, source_files in redundancies:
            print(f"Target file: {target_file}")
            print("Similar files in source folder:")
            for source_file in source_files:
                print(f"  - {source_file}")
            print()
    else:
        print("No redundancies found.")