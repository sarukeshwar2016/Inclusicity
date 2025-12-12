import os

def dump_python_files(project_dir, output_file="project_dump.txt"):
    exclude_dirs = {"venv", "__pycache__", ".git", "node_modules"}

    with open(output_file, "w", encoding="utf-8") as out:
        for root, dirs, files in os.walk(project_dir):

            # Filter unwanted folders
            dirs[:] = [d for d in dirs if d not in exclude_dirs]

            for filename in files:
                if filename.endswith(".py"):
                    file_path = os.path.join(root, filename)

                    out.write("\n" + "=" * 80 + "\n")
                    out.write(f"FILE: {file_path}\n")
                    out.write("=" * 80 + "\n\n")

                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            out.write(f.read())
                    except Exception as e:
                        out.write(f"[ERROR READING FILE] {e}")

                    out.write("\n\n")

    print(f"Dump completed! Saved as: {output_file}")



# IMPORTANT: Call the function here
if __name__ == "__main__":
    dump_python_files(project_dir=".")
