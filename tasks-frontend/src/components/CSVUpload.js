import React, { useState } from 'react';
import axios from 'axios';

const CSVUpload = () => {
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState(["Name", "Email"]);
  const [duplicates, setDuplicates] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = e => {
    setFile(e.target.files[0]);
    setError("");
    setDuplicates([]);
  };

  const handleUpload = async () => {
    if (!file) return setError("Please select a CSV file to upload.");
    setLoading(true);
    setError("");
    setDuplicates([]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("columns", columns.join(","));

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/upload-csv-python`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.error) {
        setError(res.data.error + (res.data.details ? `: ${res.data.details}` : ""));
      } else {
        setDuplicates(res.data.duplicates || []);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "30px auto" }}>
      <h2>Upload CSV to Find Duplicates</h2>

      <input type="file" accept=".csv" onChange={handleFileChange} />

      <div style={{ marginTop: 10 }}>
        <h3>Columns to check:</h3>
        <input
          type="text"
          value={columns.join(",")}
          onChange={e => setColumns(e.target.value.split(",").map(c => c.trim()))}
          placeholder="Enter columns, comma separated"
          style={{ width: "100%" }}
        />
      </div>

      <button onClick={handleUpload} style={{ marginTop: 10 }} disabled={loading}>
        {loading ? "Processing..." : "Upload & Check"}
      </button>

      {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}

      {duplicates.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Duplicates found:</h3>
          <ul>
            {duplicates.map((row, i) => (
              <li key={i}>{JSON.stringify(row)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CSVUpload;
