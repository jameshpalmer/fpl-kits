import zipfile
import os


def get_unzipped(folder_path):
    """
    Gets file paths for all directories in contained in folder_path.
    """
    return [f.path for f in os.scandir(folder_path) if f.is_dir()]


def zip_folder(folder_path, zip_path):
    """
    Compresses a folder at folder_path and saves the compressed file at zip_path.
    """
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                zip_file.write(
                    os.path.join(root, file),
                    os.path.relpath(
                        os.path.join(root, file), os.path.join(folder_path, "..")
                    ),
                )


if __name__ == "__main__":
    folder = "chrome-extensions/unzipped"
    extensions = get_unzipped(folder)
    for extension in extensions:
        zip_folder(
            extension, "chrome-extensions/zipped/" + extension.split("/")[-1] + ".zip"
        )
