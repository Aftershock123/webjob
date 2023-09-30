const fs = require('fs');
const path = require('path');

// Function to delete PDF files based on a specified date
const deletePDFsOlderThanDate = async(directory, date)=> {
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(directory, file);

      fs.stat(filePath, (statErr, stats) => {
        if (statErr) {
          console.error('Error getting file stats:', statErr);
          return;
        }

        if (stats.isFile() && path.extname(file).toLowerCase() === '.pdf') {
          const fileModifiedDate = stats.mtime;

          if (fileModifiedDate < date) {
            fs.unlink(filePath, unlinkErr => {
              if (unlinkErr) {
                console.error('Error deleting file:', unlinkErr);
              } else {
                console.log('Deleted file:', filePath);
              }
            });
          }
        }
      });
    });
  });
}

// Usage example: Deleting PDF files older than a specific date
const targetDirectory = './path/to/pdf/files'; // Change to your actual directory
const deletionDate = new Date('2023-09-02'); // Change to your desired deletion date

deletePDFsOlderThanDate(targetDirectory, deletionDate);




///ดูวันที่ของไฟล์ check

const getFileCreationDate = async (filePath) =>{
  try {
    const stats = fs.statSync(filePath);
    return stats.birthtime; // Access the file creation date
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// Example usage
const filePath = 'path/to/your/file.txt'; // Replace with the actual file path
const creationDate =await getFileCreationDate(filePath);

if (creationDate) {
  console.log('File creation date:', creationDate);
} else {
  console.log('Unable to retrieve file creation date.');
}
