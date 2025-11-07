// server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: 'Username and password are required' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [
      username,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.user = {
      user_id: user.user_id,
      username: user.username,
      name: user.name,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Role-based authorization middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// ✅ MySQL Connection (Pool)
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'brgy145',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

// Generate document hash for verification
function generateDocumentHash(certificateData) {
  const dataString = JSON.stringify({
    id: certificateData.indigency_id || certificateData.business_clearance_id,
    name: certificateData.full_name,
    dateIssued: certificateData.date_issued,
    transactionNumber: certificateData.transaction_number,
    type: certificateData.type || 'indigency',
  });

  return crypto
    .createHash('sha256')
    .update(dataString)
    .digest('hex')
    .substring(0, 16);
}

// Generate transaction number
function generateTransactionNumber() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `IND-${year}${month}${day}${hours}${minutes}${seconds}-${random}`;
}

// Generate transaction number for different form types
function generateTransactionNumberForType(type) {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `${type}-${year}${month}${day}${hours}${minutes}${seconds}-${random}`;
}

/**
 * ROOT
 */
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Barangay 145 API 🚀' });
});

/**
 * CERTIFICATE VERIFICATION
 */

// API endpoint to verify certificate (for JSON response)
app.get('/verify/indigency/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { hash } = req.query;

    const [rows] = await pool.query(
      `SELECT indigency_id, full_name, address, dob, age, provincial_address,
              contact_no, civil_status, remarks, request_reason, date_issued,
              transaction_number, date_created, is_active
       FROM indigency
       WHERE indigency_id = ? AND is_active = TRUE`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        valid: false,
        message: 'Certificate not found or has been revoked',
      });
    }

    const certificate = rows[0];
    const serverHash = generateDocumentHash(certificate);

    if (hash && hash !== serverHash) {
      return res.status(400).json({
        valid: false,
        message:
          'Certificate hash mismatch - document may have been tampered with',
      });
    }

    res.json({
      valid: true,
      message: 'Certificate is authentic',
      certificate: {
        id: certificate.indigency_id,
        transaction_number: certificate.transaction_number,
        full_name: certificate.full_name,
        address: certificate.address,
        date_issued: certificate.date_issued,
        civil_status: certificate.civil_status,
        date_created: certificate.date_created,
      },
      hash: serverHash,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      valid: false,
      message: 'Verification failed due to server error',
    });
  }
});

// HTML verification page (for QR code scanning)
app.get('/verify/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { hash } = req.query;

    const [rows] = await pool.query(
      `SELECT indigency_id, full_name, address, date_issued, civil_status,
              transaction_number, is_active
       FROM indigency WHERE indigency_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Certificate Verification</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .invalid { background: #fee; border: 2px solid #c00; padding: 20px; border-radius: 8px; }
            h1 { color: #333; }
            .status { font-size: 24px; font-weight: bold; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="invalid">
            <h1>⚠️ Certificate Not Found</h1>
            <p class="status">INVALID</p>
            <p>This certificate does not exist in our records or has been revoked.</p>
          </div>
        </body>
        </html>
      `);
    }

    const certificate = rows[0];
    const serverHash = generateDocumentHash(certificate);
    const isValid = hash === serverHash && certificate.is_active;

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate Verification - Barangay 145</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 700px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .invalid { border-left: 5px solid #c00; }
          .valid { border-left: 5px solid #0c0; }
          h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
          }
          .status {
            font-size: 20px;
            font-weight: bold;
            margin: 20px 0;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
          }
          .status.valid-status {
            background: #d4edda;
            color: #155724;
          }
          .status.invalid-status {
            background: #f8d7da;
            color: #721c24;
          }
          .details {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
            margin-top: 20px;
          }
          .detail-row {
            margin: 12px 0;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: bold;
            color: #555;
            display: inline-block;
            width: 180px;
          }
          .value {
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #0b7030;
          }
          .logo-text {
            color: #0b7030;
            font-size: 16px;
            font-weight: bold;
          }
          .hash {
            font-family: monospace;
            background: #e9ecef;
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 12px;
            word-break: break-all;
          }
          .transaction-number {
            font-family: monospace;
            background: #fff3cd;
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 14px;
            font-weight: bold;
            color: #856404;
          }
        </style>
      </head>
      <body>
        <div class="container ${isValid ? 'valid' : 'invalid'}">
          <div class="header">
            <div class="logo-text">BARANGAY 145 ZONE 13 DIST. 1</div>
            <div class="logo-text">CITY OF CALOOCAN</div>
            <h1>Certificate Verification</h1>
          </div>
         
          <div class="status ${isValid ? 'valid-status' : 'invalid-status'}">
            ${isValid ? '✓ CERTIFICATE IS AUTHENTIC' : '⚠️ VERIFICATION FAILED'}
          </div>
         
          ${
            isValid
              ? `
            <p style="text-align: center; color: #666;">
              This Certificate of Indigency has been verified as authentic and valid.
            </p>
           
            <div class="details">
              <h3 style="margin-top: 0; color: #0b7030;">Certificate Details</h3>
              <div class="detail-row">
                <span class="label">Certificate ID:</span>
                <span class="value">${certificate.indigency_id}</span>
              </div>
              <div class="detail-row">
                <span class="label">Transaction Number:</span>
                <span class="value transaction-number">${
                  certificate.transaction_number || 'N/A'
                }</span>
              </div>
              <div class="detail-row">
                <span class="label">Full Name:</span>
                <span class="value">${certificate.full_name}</span>
              </div>
              <div class="detail-row">
                <span class="label">Address:</span>
                <span class="value">${certificate.address}</span>
              </div>
              <div class="detail-row">
                <span class="label">Civil Status:</span>
                <span class="value">${certificate.civil_status}</span>
              </div>
              <div class="detail-row">
                <span class="label">Date Issued:</span>
                <span class="value">${new Date(
                  certificate.date_issued
                ).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}</span>
              </div>
              <div class="detail-row">
                <span class="label">Verification Hash:</span>
                <span class="value hash">${serverHash}</span>
              </div>
            </div>
          `
              : `
            <p style="text-align: center; color: #721c24;">
              ${
                hash
                  ? 'The certificate hash does not match our records. This document may have been tampered with.'
                  : 'No verification hash provided.'
              }
            </p>
            <div class="details">
              <h3 style="margin-top: 0; color: #c00;">Why This Failed:</h3>
              <ul>
                <li>The document content may have been modified</li>
                <li>The certificate may have been forged</li>
                <li>The QR code may have been replaced</li>
              </ul>
              <p style="margin-top: 20px;">
                <strong>Certificate ID Found:</strong> ${
                  certificate.indigency_id
                }<br>
                <strong>Transaction Number:</strong> ${
                  certificate.transaction_number || 'N/A'
                }<br>
                <strong>Name on Record:</strong> ${certificate.full_name}
              </p>
            </div>
          `
          }
         
          <p style="text-align: center; margin-top: 30px; color: #888; font-size: 14px;">
            For inquiries, please contact Barangay 145 Office<br>
            Tel. No. 8711-7134
          </p>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('Verification system error');
  }
});

// Get verification hash for a certificate
app.get('/api/indigency/:id/hash', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT indigency_id, full_name, date_issued, transaction_number
       FROM indigency WHERE indigency_id = ? AND is_active = TRUE`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const hash = generateDocumentHash(rows[0]);
    res.json({
      hash,
      certificate_id: id,
      transaction_number: rows[0].transaction_number,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate hash' });
  }
});

// API endpoint to verify business clearance certificate (for JSON response)
app.get('/verify/business-clearance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { hash } = req.query;

    const [rows] = await pool.query(
      `SELECT business_clearance_id, full_name, address, dob, age, provincial_address,
              contact_no, civil_status, remarks, request_reason, date_issued,
              transaction_number, date_created, is_active
       FROM business_clearance
       WHERE business_clearance_id = ? AND is_active = TRUE`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        valid: false,
        message: 'Certificate not found or has been revoked',
      });
    }

    const certificate = rows[0];
    const serverHash = generateDocumentHash({
      ...certificate,
      indigency_id: certificate.business_clearance_id,
      type: 'business_clearance',
    });

    if (hash && hash !== serverHash) {
      return res.status(400).json({
        valid: false,
        message:
          'Certificate hash mismatch - document may have been tampered with',
      });
    }

    res.json({
      valid: true,
      message: 'Certificate is authentic',
      certificate: {
        id: certificate.business_clearance_id,
        transaction_number: certificate.transaction_number,
        full_name: certificate.full_name,
        address: certificate.address,
        date_issued: certificate.date_issued,
        civil_status: certificate.civil_status,
        date_created: certificate.date_created,
      },
      hash: serverHash,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      valid: false,
      message: 'Verification failed due to server error',
    });
  }
});

// Get verification hash for business clearance certificate
app.get('/api/business-clearance/:id/hash', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT business_clearance_id, full_name, date_issued, transaction_number
       FROM business_clearance WHERE business_clearance_id = ? AND is_active = TRUE`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const hash = generateDocumentHash({
      ...rows[0],
      indigency_id: rows[0].business_clearance_id,
      type: 'business_clearance',
    });
    res.json({
      hash,
      certificate_id: id,
      transaction_number: rows[0].transaction_number,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate hash' });
  }
});

/**
 * INDIGENCY CRUD
 */

// GET all active indigency records
app.get('/indigency', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         indigency_id, resident_id, full_name, address, provincial_address,
         dob, age, civil_status, contact_no, request_reason, remarks,
         date_issued, transaction_number, date_created, date_updated, is_active
       FROM indigency
       WHERE is_active = TRUE
       ORDER BY indigency_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch indigency records' });
  }
});

// GET single record by ID
app.get('/indigency/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT
         indigency_id, resident_id, full_name, address, provincial_address,
         dob, age, civil_status, contact_no, request_reason, remarks,
         date_issued, transaction_number, date_created, date_updated, is_active
       FROM indigency
       WHERE indigency_id = ?`,
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

// GET record by transaction number
app.get('/indigency/transaction/:transactionNumber', async (req, res) => {
  try {
    const { transactionNumber } = req.params;
    const [rows] = await pool.query(
      `SELECT
         indigency_id, resident_id, full_name, address, provincial_address,
         dob, age, civil_status, contact_no, request_reason, remarks,
         date_issued, transaction_number, date_created, date_updated, is_active
       FROM indigency
       WHERE transaction_number = ? AND is_active = TRUE`,
      [transactionNumber]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'Certificate not found with this transaction number' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

// CREATE new record
app.post('/indigency', async (req, res) => {
  try {
    const {
      resident_id,
      full_name,
      address,
      provincial_address,
      dob,
      age,
      civil_status,
      contact_no,
      request_reason,
      remarks,
      date_issued,
      transaction_number,
    } = req.body;

    if (
      !resident_id ||
      !full_name ||
      !address ||
      !dob ||
      !Number.isFinite(Number(age)) ||
      !civil_status ||
      !request_reason ||
      !date_issued
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate transaction number if not provided
    const finalTransactionNumber =
      transaction_number || generateTransactionNumber();

    // Check if transaction number already exists
    const [existing] = await pool.query(
      'SELECT indigency_id FROM indigency WHERE transaction_number = ?',
      [finalTransactionNumber]
    );

    if (existing.length > 0) {
      // If collision, generate a new one
      const newTransactionNumber = generateTransactionNumber();
      const [result] = await pool.query(
        `INSERT INTO indigency
          (resident_id, full_name, address, provincial_address, dob, age,
           civil_status, contact_no, request_reason, remarks, date_issued, transaction_number)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          resident_id,
          full_name,
          address,
          provincial_address || null,
          dob,
          Number(age),
          civil_status,
          contact_no || null,
          request_reason,
          remarks || null,
          date_issued,
          newTransactionNumber,
        ]
      );

      const [rows] = await pool.query(
        `SELECT * FROM indigency WHERE indigency_id = ?`,
        [result.insertId]
      );

      return res.status(201).json(rows[0]);
    }

    const [result] = await pool.query(
      `INSERT INTO indigency
        (resident_id, full_name, address, provincial_address, dob, age,
         civil_status, contact_no, request_reason, remarks, date_issued, transaction_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resident_id,
        full_name,
        address,
        provincial_address || null,
        dob,
        Number(age),
        civil_status,
        contact_no || null,
        request_reason,
        remarks || null,
        date_issued,
        finalTransactionNumber,
      ]
    );

    const [rows] = await pool.query(
      `SELECT * FROM indigency WHERE indigency_id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// UPDATE existing record
app.put('/indigency/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      resident_id,
      full_name,
      address,
      provincial_address,
      dob,
      age,
      civil_status,
      contact_no,
      request_reason,
      remarks,
      date_issued,
      transaction_number,
    } = req.body;

    if (
      !full_name ||
      !address ||
      !dob ||
      !Number.isFinite(Number(age)) ||
      !civil_status ||
      !request_reason ||
      !date_issued
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // If transaction number is being updated, check if it already exists
    if (transaction_number) {
      const [existing] = await pool.query(
        'SELECT indigency_id FROM indigency WHERE transaction_number = ? AND indigency_id != ?',
        [transaction_number, id]
      );

      if (existing.length > 0) {
        return res
          .status(400)
          .json({ error: 'Transaction number already exists' });
      }
    }

    const [result] = await pool.query(
      `UPDATE indigency
       SET resident_id = ?, full_name = ?, address = ?, provincial_address = ?,
           dob = ?, age = ?, civil_status = ?, contact_no = ?,
           request_reason = ?, remarks = ?, date_issued = ?,
           transaction_number = COALESCE(?, transaction_number),
           date_updated = NOW()
       WHERE indigency_id = ?`,
      [
        resident_id,
        full_name,
        address,
        provincial_address,
        dob,
        Number(age),
        civil_status,
        contact_no,
        request_reason,
        remarks,
        date_issued,
        transaction_number,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    const [updatedRows] = await pool.query(
      `SELECT * FROM indigency WHERE indigency_id = ?`,
      [id]
    );

    res.json(updatedRows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// DELETE indigency record (soft delete)
app.delete('/indigency/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `UPDATE indigency
       SET is_active = FALSE, date_updated = NOW()
       WHERE indigency_id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

/**
 * REQUEST RECORDS
 */
app.get('/request-records', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, address, birthday, age, provincial_address, contact_no, civil_status, request_reason, date_issued, date_created, date_updated, is_active
       FROM request_records
       WHERE is_active = TRUE
       ORDER BY id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

app.get('/request-records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT id, name, address, birthday, age, provincial_address, contact_no, civil_status, request_reason, date_issued, date_created, date_updated, is_active
       FROM request_records WHERE id = ?`,
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

app.post('/request-records', async (req, res) => {
  try {
    const {
      name,
      address,
      birthday,
      age,
      provincial_address,
      contact_no,
      civil_status,
      request_reason,
      date_issued,
    } = req.body;

    if (
      !name ||
      !address ||
      !birthday ||
      !Number.isFinite(Number(age)) ||
      !civil_status ||
      !request_reason ||
      !date_issued
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await pool.query(
      `INSERT INTO request_records (name, address, birthday, age, provincial_address, contact_no, civil_status, request_reason, date_issued)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        name,
        address,
        birthday,
        Number(age),
        provincial_address || null,
        contact_no || null,
        civil_status,
        request_reason,
        date_issued,
      ]
    );

    const [rows] = await pool.query(
      `SELECT * FROM request_records WHERE id = ?`,
      [result.insertId]
    );
    res.status(201).json({ id: result.insertId, ...rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

app.put('/request-records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      address,
      birthday,
      age,
      provincial_address,
      contact_no,
      civil_status,
      request_reason,
      date_issued,
      is_active,
    } = req.body;

    const [result] = await pool.query(
      `UPDATE request_records SET
        name = ?, address = ?, birthday = ?, age = ?, provincial_address = ?, contact_no = ?, civil_status = ?, request_reason = ?, date_issued = ?, is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        name,
        address,
        birthday,
        Number(age),
        provincial_address || null,
        contact_no || null,
        civil_status,
        request_reason,
        date_issued,
        is_active,
        id,
      ]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

app.delete('/request-records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `DELETE FROM request_records WHERE id = ?`,
      [id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

/**
 * RESIDENTS
 */
app.get('/residents', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM residents ORDER BY resident_id DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch residents' });
  }
});

app.post('/residents', async (req, res) => {
  const {
    full_name,
    address,
    provincial_address,
    dob,
    age,
    civil_status,
    contact_no,
  } = req.body;
  try {
    const [existing] = await pool.query(
      'SELECT * FROM residents WHERE LOWER(full_name) = LOWER(?) AND dob = ?',
      [full_name, dob]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: 'Resident already exists (same name and date of birth)',
      });
    }

    const [result] = await pool.query(
      `INSERT INTO residents
        (full_name, address, provincial_address, dob, age, civil_status, contact_no)
       VALUES (?,?,?,?,?,?,?)`,
      [
        full_name,
        address,
        provincial_address,
        dob,
        age,
        civil_status,
        contact_no,
      ]
    );

    res.json({
      message: 'Resident added successfully',
      resident_id: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add resident' });
  }
});

app.put('/residents/:id', async (req, res) => {
  const { id } = req.params;
  const {
    full_name,
    address,
    provincial_address,
    dob,
    age,
    civil_status,
    contact_no,
  } = req.body;

  try {
    const [existing] = await pool.query(
      'SELECT * FROM residents WHERE LOWER(full_name) = LOWER(?) AND dob = ? AND resident_id != ?',
      [full_name, dob, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error:
          'Another resident with same name and date of birth already exists',
      });
    }

    await pool.query(
      `UPDATE residents
       SET full_name = ?, address = ?, provincial_address = ?, dob = ?,
           age = ?, civil_status = ?, contact_no = ?
       WHERE resident_id = ?`,
      [
        full_name,
        address,
        provincial_address,
        dob,
        age,
        civil_status,
        contact_no,
        id,
      ]
    );

    res.json({ message: 'Resident updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update resident' });
  }
});

app.delete('/residents/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      'DELETE FROM residents WHERE resident_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Resident not found' });
    }

    res.json({ message: 'Resident deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete resident' });
  }
});


/**
 * AUTHENTICATION
 */
app.post('/auth/login', authenticateUser, (req, res) => {
  res.json({
    message: 'Login successful',
    user: req.user,
  });
});

/**
 * USERS
 */
app.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT user_id, username, name, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/users', async (req, res) => {
  const { username, name, password, role } = req.body;

  if (!username || !name || !password) {
    return res
      .status(400)
      .json({ error: 'Username, name, and password are required' });
  }

  try {
    const [existingUsers] = await pool.query(
      'SELECT user_id FROM users WHERE username = ?',
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (username, name, password, role) VALUES (?,?,?,?)`,
      [username, name, hashedPassword, role || 'staff']
    );
    res.json({ message: 'User created', user_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, name, password, role } = req.body;

  if (!username || !name) {
    return res.status(400).json({ error: 'Username and name are required' });
  }

  try {
    const [existingUsers] = await pool.query(
      'SELECT user_id FROM users WHERE username = ? AND user_id != ?',
      [username, id]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    let updateQuery = 'UPDATE users SET username = ?, name = ?, role = ?';
    let queryParams = [username, name, role];

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = ?';
      queryParams.push(hashedPassword);
    }

    updateQuery += ' WHERE user_id = ?';
    queryParams.push(id);

    await pool.query(updateQuery, queryParams);
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM users WHERE user_id = ?', [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// BARANGAY CLEARANCE CRUD START
/**
 * BARANGAY CLEARANCE CRUD
 */

// GET all active clearance records
app.get('/barangay-clearance', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM barangay_clearance WHERE is_active = TRUE ORDER BY barangay_clearance_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: 'Failed to fetch barangay clearance records' });
  }
});

// GET single clearance by ID
app.get('/barangay-clearance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM barangay_clearance WHERE barangay_clearance_id = ?`,
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

// CREATE new barangay clearance
app.post('/barangay-clearance', async (req, res) => {
  try {
    const {
      resident_id,
      full_name,
      address,
      provincial_address,
      dob,
      age,
      civil_status,
      contact_no,
      request_reason, // coming from frontend
      remarks,
      date_issued,
      transaction_number,
    } = req.body;

    if (!full_name || !address || !request_reason || !date_issued) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const finalTransactionNumber =
      transaction_number || `CLR-${Date.now().toString().slice(-8)}`;

    const [result] = await pool.query(
      `INSERT INTO barangay_clearance 
        (resident_id, full_name, address, provincial_address, dob, age, civil_status, contact_no, request_reason, remarks, date_issued, transaction_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resident_id,
        full_name,
        address,
        provincial_address,
        dob,
        age,
        civil_status,
        contact_no,
        request_reason,
        remarks,
        date_issued,
        finalTransactionNumber,
      ]
    );

    const [rows] = await pool.query(
      `SELECT * FROM barangay_clearance WHERE barangay_clearance_id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// UPDATE existing record
app.put('/barangay-clearance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      resident_id,
      full_name,
      address,
      provincial_address,
      dob,
      age,
      civil_status,
      contact_no,
      request_reason,
      remarks,
      date_issued,
      transaction_number,
    } = req.body;

    const [result] = await pool.query(
      `UPDATE barangay_clearance
       SET resident_id=?, full_name=?, address=?, provincial_address=?, dob=?, age=?, civil_status=?, contact_no=?, request_reason=?, remarks=?, date_issued=?, transaction_number=?, date_updated=NOW()
       WHERE barangay_clearance_id=?`,
      [
        resident_id,
        full_name,
        address,
        provincial_address,
        dob,
        age,
        civil_status,
        contact_no,
        request_reason,
        remarks,
        date_issued,
        transaction_number,
        id,
      ]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Record not found' });

    const [updated] = await pool.query(
      `SELECT * FROM barangay_clearance WHERE barangay_clearance_id = ?`,
      [id]
    );

    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// DELETE (soft delete)
app.delete('/barangay-clearance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `UPDATE barangay_clearance SET is_active = FALSE, date_updated = NOW() WHERE barangay_clearance_id = ?`,
      [id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

// BARANGAY CLEARANCE CRUD END

/**
 * BUSINESS CLEARANCE CRUD
 * Updated to match the new business_clearance table schema.
 */

// GET all active business clearance records
// NO CHANGES NEEDED - This will automatically adapt to the new table structure.
app.get('/business-clearance', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM business_clearance WHERE is_active = TRUE ORDER BY business_clearance_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: 'Failed to fetch business clearance records' });
  }
});

// GET single business clearance by ID
// NO CHANGES NEEDED
app.get('/business-clearance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM business_clearance WHERE business_clearance_id = ?`,
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

// CREATE new business clearance
// MODIFIED: Updated fields to match the new table schema.
app.post('/business-clearance', async (req, res) => {
  try {
    const {
      resident_id,
      full_name,
      address,
      nature_of_business, // ADDED
      date_issued,
      date_expired, // ADDED
      remarks,
      request_reason,
      transaction_number,
    } = req.body;

    // MODIFIED: Updated validation to include new required fields.
    if (!full_name || !address || !nature_of_business || !date_issued || !date_expired || !request_reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const finalTransactionNumber =
      transaction_number || generateTransactionNumberForType('BUS');

    // Check if transaction number already exists
    const [existing] = await pool.query(
      'SELECT business_clearance_id FROM business_clearance WHERE transaction_number = ?',
      [finalTransactionNumber]
    );

    if (existing.length > 0) {
      // If collision, generate a new one
      const newTransactionNumber = generateTransactionNumberForType('BUS');
      // MODIFIED: Query now matches the new schema.
      const [result] = await pool.query(
        `INSERT INTO business_clearance 
          (resident_id, full_name, address, nature_of_business, date_issued, date_expired, remarks, request_reason, transaction_number)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          resident_id,
          full_name,
          address,
          nature_of_business,
          date_issued,
          date_expired,
          remarks || null,
          request_reason,
          newTransactionNumber,
        ]
      );

      const [rows] = await pool.query(
        `SELECT * FROM business_clearance WHERE business_clearance_id = ?`,
        [result.insertId]
      );

      return res.status(201).json(rows[0]);
    }

    // MODIFIED: Query now matches the new schema.
    const [result] = await pool.query(
      `INSERT INTO business_clearance 
        (resident_id, full_name, address, nature_of_business, date_issued, date_expired, remarks, request_reason, transaction_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resident_id,
        full_name,
        address,
        nature_of_business,
        date_issued,
        date_expired,
        remarks || null,
        request_reason,
        finalTransactionNumber,
      ]
    );

    const [rows] = await pool.query(
      `SELECT * FROM business_clearance WHERE business_clearance_id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// UPDATE existing business clearance
// MODIFIED: Updated fields to match the new table schema.
app.put('/business-clearance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      resident_id,
      full_name,
      address,
      nature_of_business, // ADDED
      date_issued,
      date_expired, // ADDED
      remarks,
      request_reason,
      transaction_number,
    } = req.body;

    // If transaction number is being updated, check if it already exists
    if (transaction_number) {
      const [existing] = await pool.query(
        'SELECT business_clearance_id FROM business_clearance WHERE transaction_number = ? AND business_clearance_id != ?',
        [transaction_number, id]
      );

      if (existing.length > 0) {
        return res
          .status(400)
          .json({ error: 'Transaction number already exists' });
      }
    }

    // MODIFIED: Query now matches the new schema.
    const [result] = await pool.query(
      `UPDATE business_clearance
       SET resident_id=?, full_name=?, address=?, nature_of_business=?, date_issued=?, date_expired=?, remarks=?, request_reason=?, transaction_number=COALESCE(?, transaction_number), date_updated=NOW()
       WHERE business_clearance_id=?`,
      [
        resident_id,
        full_name,
        address,
        nature_of_business,
        date_issued,
        date_expired,
        remarks,
        request_reason,
        transaction_number,
        id,
      ]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Record not found' });

    const [updated] = await pool.query(
      `SELECT * FROM business_clearance WHERE business_clearance_id = ?`,
      [id]
    );

    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// DELETE business clearance (soft delete)
// NO CHANGES NEEDED
app.delete('/business-clearance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `UPDATE business_clearance SET is_active = FALSE, date_updated = NOW() WHERE business_clearance_id = ?`,
      [id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

/**
 * CERTIFICATE OF RESIDENCY CRUD
 */

// GET all active certificate of residency records
app.get('/certificate-of-residency', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM certificate_of_residency WHERE is_active = TRUE ORDER BY certificate_of_residency_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: 'Failed to fetch certificate of residency records' });
  }
});

// GET single certificate of residency by ID
app.get('/certificate-of-residency/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM certificate_of_residency WHERE certificate_of_residency_id = ?`,
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

// CREATE new certificate of residency
app.post('/certificate-of-residency', async (req, res) => {
  try {
    const {
      resident_id,
      full_name,
      address,
      provincial_address,
      dob,
      age,
      civil_status,
      contact_no,
      request_reason,
      remarks,
      date_issued,
      transaction_number,
    } = req.body;

    if (!full_name || !address || !request_reason || !date_issued) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const finalTransactionNumber =
      transaction_number || `RES-${Date.now().toString().slice(-8)}`;

    const [result] = await pool.query(
      `INSERT INTO certificate_of_residency 
        (resident_id, full_name, address, provincial_address, dob, age, civil_status, contact_no, request_reason, remarks, date_issued, transaction_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resident_id,
        full_name,
        address,
        provincial_address,
        dob,
        age,
        civil_status,
        contact_no,
        request_reason,
        remarks,
        date_issued,
        finalTransactionNumber,
      ]
    );

    const [rows] = await pool.query(
      `SELECT * FROM certificate_of_residency WHERE certificate_of_residency_id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// UPDATE existing certificate of residency
app.put('/certificate-of-residency/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      resident_id,
      full_name,
      address,
      provincial_address,
      dob,
      age,
      civil_status,
      contact_no,
      request_reason,
      remarks,
      date_issued,
      transaction_number,
    } = req.body;

    const [result] = await pool.query(
      `UPDATE certificate_of_residency
       SET resident_id=?, full_name=?, address=?, provincial_address=?, dob=?, age=?, civil_status=?, contact_no=?, request_reason=?, remarks=?, date_issued=?, transaction_number=?, date_updated=NOW()
       WHERE certificate_of_residency_id=?`,
      [
        resident_id,
        full_name,
        address,
        provincial_address,
        dob,
        age,
        civil_status,
        contact_no,
        request_reason,
        remarks,
        date_issued,
        transaction_number,
        id,
      ]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Record not found' });

    const [updated] = await pool.query(
      `SELECT * FROM certificate_of_residency WHERE certificate_of_residency_id = ?`,
      [id]
    );

    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// DELETE certificate of residency (soft delete)
app.delete('/certificate-of-residency/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `UPDATE certificate_of_residency SET is_active = FALSE, date_updated = NOW() WHERE certificate_of_residency_id = ?`,
      [id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

/**
 * PERMIT TO TRAVEL CRUD
 */

// GET all active permit to travel records
app.get('/permit-to-travel', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM permit_to_travel WHERE is_active = TRUE ORDER BY permit_to_travel_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch permit to travel records' });
  }
});

// GET single permit to travel by ID
app.get('/permit-to-travel/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM permit_to_travel WHERE permit_to_travel_id = ?`,
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

// CREATE new permit to travel
app.post('/permit-to-travel', async (req, res) => {
  try {
    const {
      resident_id,
      full_name,
      address,
      provincial_address,
      dob,
      age,
      civil_status,
      contact_no,
      request_reason,
      remarks,
      date_issued,
      transaction_number,
    } = req.body;

    if (!full_name || !address || !request_reason || !date_issued) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const finalTransactionNumber =
      transaction_number || `TRV-${Date.now().toString().slice(-8)}`;

    const [result] = await pool.query(
      `INSERT INTO permit_to_travel 
        (resident_id, full_name, address, provincial_address, dob, age, civil_status, contact_no, request_reason, remarks, date_issued, transaction_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resident_id,
        full_name,
        address,
        provincial_address,
        dob,
        age,
        civil_status,
        contact_no,
        request_reason,
        remarks,
        date_issued,
        finalTransactionNumber,
      ]
    );

    const [rows] = await pool.query(
      `SELECT * FROM permit_to_travel WHERE permit_to_travel_id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// UPDATE existing permit to travel
app.put('/permit-to-travel/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      resident_id,
      full_name,
      address,
      provincial_address,
      dob,
      age,
      civil_status,
      contact_no,
      request_reason,
      remarks,
      date_issued,
      transaction_number,
    } = req.body;

    const [result] = await pool.query(
      `UPDATE permit_to_travel
       SET resident_id=?, full_name=?, address=?, provincial_address=?, dob=?, age=?, civil_status=?, contact_no=?, request_reason=?, remarks=?, date_issued=?, transaction_number=?, date_updated=NOW()
       WHERE permit_to_travel_id=?`,
      [
        resident_id,
        full_name,
        address,
        provincial_address,
        dob,
        age,
        civil_status,
        contact_no,
        request_reason,
        remarks,
        date_issued,
        transaction_number,
        id,
      ]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Record not found' });

    const [updated] = await pool.query(
      `SELECT * FROM permit_to_travel WHERE permit_to_travel_id = ?`,
      [id]
    );

    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// DELETE permit to travel (soft delete)
app.delete('/permit-to-travel/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `UPDATE permit_to_travel SET is_active = FALSE, date_updated = NOW() WHERE permit_to_travel_id = ?`,
      [id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

/**
 * OATH JOB SEEKER CRUD
 */

// GET /oath-job - Get all oath_job records
app.get('/oath-job', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM oath_job ORDER BY date_created DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching oath_job records:', err);
    res
      .status(500)
      .json({ message: 'Error fetching records', error: err.message });
  }
});

// GET /oath-job/:id - Get a single oath_job record by ID
app.get('/oath-job/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM oath_job WHERE id = ?', [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching oath_job record:', err);
    res
      .status(500)
      .json({ message: 'Error fetching record', error: err.message });
  }
});

// POST /oath-job - Create a new oath_job record
app.post('/oath-job', async (req, res) => {
  const { resident_id, full_name, age, address, date_issued } = req.body;

  // Basic validation
  if (!full_name) {
    return res.status(400).json({ message: 'Full name is required.' });
  }

  const transaction_number = generateTransactionNumber();

  try {
    const [result] = await pool.query(
      'INSERT INTO oath_job (resident_id, transaction_number, full_name, age, address, date_issued) VALUES (?, ?, ?, ?, ?, ?)',
      [resident_id, transaction_number, full_name, age, address, date_issued]
    );
    res.status(201).json({
      message: 'Record created successfully',
      id: result.insertId,
      transaction_number: transaction_number,
      ...req.body, // Return the submitted data
    });
  } catch (err) {
    console.error('Error creating oath_job record:', err);
    res
      .status(500)
      .json({ message: 'Error creating record', error: err.message });
  }
});

// PUT /oath-job/:id - Update an existing oath_job record
app.put('/oath-job/:id', async (req, res) => {
  const { id } = req.params;
  const { resident_id, full_name, age, address, date_issued } = req.body;

  // Basic validation
  if (!full_name) {
    return res.status(400).json({ message: 'Full name is required.' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE oath_job SET resident_id = ?, full_name = ?, age = ?, address = ?, date_issued = ? WHERE id = ?',
      [resident_id, full_name, age, address, date_issued, id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'Record not found or no changes made.' });
    }
    res.json({ message: 'Record updated successfully', id: id, ...req.body });
  } catch (err) {
    console.error('Error updating oath_job record:', err);
    res
      .status(500)
      .json({ message: 'Error updating record', error: err.message });
  }
});

// DELETE /oath-job/:id - Delete an oath_job record
app.delete('/oath-job/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM oath_job WHERE id = ?', [
      id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.json({ message: 'Record deleted successfully', id: id });
  } catch (err) {
    console.error('Error deleting oath_job record:', err);
    res
      .status(500)
      .json({ message: 'Error deleting record', error: err.message });
  }
});



/**
 * CASH ASSISTANCE CRUD
 */

// GET all active cash assistance records
app.get('/cash-assistance', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM cash_assistance WHERE is_active = TRUE ORDER BY cash_assistance_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cash assistance records' });
  }
});

// GET single cash assistance record by ID
app.get('/cash-assistance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM cash_assistance WHERE cash_assistance_id = ?`,
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

// CREATE new cash assistance record
app.post('/cash-assistance', async (req, res) => {
  try {
    const {
      resident_id,
      full_name,
      since_year,
      address,
      request_reason,
      date_issued,
      transaction_number,
    } = req.body;

    if (!full_name || !address || !request_reason || !date_issued) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const finalTransactionNumber =
      transaction_number || `CA-${Date.now().toString().slice(-8)}`;

    const [result] = await pool.query(
      `INSERT INTO cash_assistance 
        (resident_id, full_name, since_year, address, request_reason, date_issued, transaction_number)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        resident_id,
        full_name,
        since_year,
        address,
        request_reason,
        date_issued,
        finalTransactionNumber,
      ]
    );

    const [rows] = await pool.query(
      `SELECT * FROM cash_assistance WHERE cash_assistance_id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// UPDATE existing cash assistance record
app.put('/cash-assistance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      resident_id,
      full_name,
      since_year,
      address,
      request_reason,
      date_issued,
      transaction_number,
    } = req.body;

    const [result] = await pool.query(
      `UPDATE cash_assistance
       SET resident_id=?, full_name=?, since_year=?, address=?, request_reason=?, date_issued=?, transaction_number=?, date_updated=NOW()
       WHERE cash_assistance_id=?`,
      [
        resident_id,
        full_name,
        since_year,
        address,
        request_reason,
        date_issued,
        transaction_number,
        id,
      ]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Record not found' });

    const [updated] = await pool.query(
      `SELECT * FROM cash_assistance WHERE cash_assistance_id = ?`,
      [id]
    );

    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// DELETE cash assistance (soft delete)
app.delete('/cash-assistance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `UPDATE cash_assistance SET is_active = FALSE, date_updated = NOW() WHERE cash_assistance_id = ?`,
      [id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});



/**
 * FINANCIAL ASSISTANCE CRUD
 */

// GET all active financial assistance records
app.get('/financial-assistance', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM financial_assistance WHERE is_active = TRUE ORDER BY financial_assistance_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch financial assistance records' });
  }
});

// GET single financial assistance record by ID
app.get('/financial-assistance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM financial_assistance WHERE financial_assistance_id = ?`,
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

// CREATE new financial assistance record
app.post('/financial-assistance', async (req, res) => {
  try {
    const {
      resident_id,
      full_name,
      age,
      dob,
      address,
      occupation,
      purpose,
      monthly_income,
      date_issued,
      transaction_number,
    } = req.body;

    if (!full_name || !address || !purpose || !date_issued) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const finalTransactionNumber =
      transaction_number || `FIN-${Date.now().toString().slice(-8)}`;

    const [result] = await pool.query(
      `INSERT INTO financial_assistance 
        (resident_id, full_name, age, dob, address, occupation, purpose, monthly_income, date_issued, transaction_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resident_id,
        full_name,
        age,
        dob,
        address,
        occupation,
        purpose,
        monthly_income,
        date_issued,
        finalTransactionNumber,
      ]
    );

    const [rows] = await pool.query(
      `SELECT * FROM financial_assistance WHERE financial_assistance_id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// UPDATE existing financial assistance record
app.put('/financial-assistance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      resident_id,
      full_name,
      age,
      dob,
      address,
      occupation,
      purpose,
      monthly_income,
      date_issued,
      transaction_number,
    } = req.body;

    const [result] = await pool.query(
      `UPDATE financial_assistance
       SET resident_id=?, full_name=?, age=?, dob=?, address=?, occupation=?, purpose=?, monthly_income=?, date_issued=?, transaction_number=?, date_updated=NOW()
       WHERE financial_assistance_id=?`,
      [
        resident_id,
        full_name,
        age,
        dob,
        address,
        occupation,
        purpose,
        monthly_income,
        date_issued,
        transaction_number,
        id,
      ]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Record not found' });

    const [updated] = await pool.query(
      `SELECT * FROM financial_assistance WHERE financial_assistance_id = ?`,
      [id]
    );

    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// DELETE financial assistance (soft delete)
app.delete('/financial-assistance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `UPDATE financial_assistance SET is_active = FALSE, date_updated = NOW() WHERE financial_assistance_id = ?`,
      [id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});





/**
 * BHERT CERTIFICATE (POSITIVE) CRUD
 */

// GET all active BHERT certificate (positive) records
app.get('/bhert-certificate-positive', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM bhert_certificate_positive WHERE is_active = TRUE ORDER BY bhert_certificate_positive_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch BHERT certificate records' });
  }
});

// GET single BHERT certificate (positive) record by ID
app.get('/bhert-certificate-positive/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM bhert_certificate_positive WHERE bhert_certificate_positive_id = ?`,
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

// CREATE new BHERT certificate (positive)
app.post('/bhert-certificate-positive', async (req, res) => {
  try {
    const {
      resident_id,
      full_name,
      address,
      request_reason,
      date_issued,
      transaction_number,
    } = req.body;

    if (!full_name || !address || !request_reason || !date_issued) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const finalTransactionNumber =
      transaction_number || `BHP-${Date.now().toString().slice(-8)}`;

    const [result] = await pool.query(
      `INSERT INTO bhert_certificate_positive 
        (resident_id, full_name, address, request_reason, date_issued, transaction_number)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        resident_id,
        full_name,
        address,
        request_reason,
        date_issued,
        finalTransactionNumber,
      ]
    );

    const [rows] = await pool.query(
      `SELECT * FROM bhert_certificate_positive WHERE bhert_certificate_positive_id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// UPDATE existing BHERT certificate (positive)
app.put('/bhert-certificate-positive/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      resident_id,
      full_name,
      address,
      request_reason,
      date_issued,
      transaction_number,
    } = req.body;

    const [result] = await pool.query(
      `UPDATE bhert_certificate_positive
       SET resident_id=?, full_name=?, address=?, request_reason=?, date_issued=?, transaction_number=?, date_updated=NOW()
       WHERE bhert_certificate_positive_id=?`,
      [
        resident_id,
        full_name,
        address,
        request_reason,
        date_issued,
        transaction_number,
        id,
      ]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Record not found' });

    const [updated] = await pool.query(
      `SELECT * FROM bhert_certificate_positive WHERE bhert_certificate_positive_id = ?`,
      [id]
    );

    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// DELETE BHERT certificate (positive) (soft delete)
app.delete('/bhert-certificate-positive/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `UPDATE bhert_certificate_positive SET is_active = FALSE, date_updated = NOW() WHERE bhert_certificate_positive_id = ?`,
      [id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});


/**
 * CERTIFICATE OF ACTION CRUD
 */

// GET all active certificate of action records
app.get('/certificate-of-action', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM certificate_of_action WHERE is_active = TRUE ORDER BY certificate_of_action_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch certificate of action records' });
  }
});

// GET single certificate of action record by ID
app.get('/certificate-of-action/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM certificate_of_action WHERE certificate_of_action_id = ?`,
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

// CREATE new certificate of action
app.post('/certificate-of-action', async (req, res) => {
  try {
    const {
      resident_id,
      complainant_name,
      respondent_name,
      barangay_case_no,
      request_reason,
      filed_date,
      date_issued,
      transaction_number,
    } = req.body;

    if (!complainant_name || !respondent_name || !request_reason || !date_issued) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const finalTransactionNumber =
      transaction_number || `CACT-${Date.now().toString().slice(-8)}`;

    const [result] = await pool.query(
      `INSERT INTO certificate_of_action 
        (resident_id, complainant_name, respondent_name, barangay_case_no, request_reason, filed_date, date_issued, transaction_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resident_id,
        complainant_name,
        respondent_name,
        barangay_case_no,
        request_reason,
        filed_date,
        date_issued,
        finalTransactionNumber,
      ]
    );

    const [rows] = await pool.query(
      `SELECT * FROM certificate_of_action WHERE certificate_of_action_id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// UPDATE existing certificate of action
app.put('/certificate-of-action/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      resident_id,
      complainant_name,
      respondent_name,
      barangay_case_no,
      request_reason,
      filed_date,
      date_issued,
      transaction_number,
    } = req.body;

    const [result] = await pool.query(
      `UPDATE certificate_of_action
       SET resident_id=?, complainant_name=?, respondent_name=?, barangay_case_no=?, request_reason=?, filed_date=?, date_issued=?, transaction_number=?, date_updated=NOW()
       WHERE certificate_of_action_id=?`,
      [
        resident_id,
        complainant_name,
        respondent_name,
        barangay_case_no,
        request_reason,
        filed_date,
        date_issued,
        transaction_number,
        id,
      ]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Record not found' });

    const [updated] = await pool.query(
      `SELECT * FROM certificate_of_action WHERE certificate_of_action_id = ?`,
      [id]
    );

    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// DELETE certificate of action (soft delete)
app.delete('/certificate-of-action/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `UPDATE certificate_of_action SET is_active = FALSE, date_updated = NOW() WHERE certificate_of_action_id = ?`,
      [id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});


/**
 * CERTIFICATE OF COHABITATION CRUD
 */

// GET all active cohabitation certificate records
app.get('/certificate-of-cohabitation', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM certificate_of_cohabitation WHERE is_active = TRUE ORDER BY certificate_of_cohabitation_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cohabitation certificate records' });
  }
});

// GET single cohabitation certificate by ID
app.get('/certificate-of-cohabitation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM certificate_of_cohabitation WHERE certificate_of_cohabitation_id = ?`,
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

// CREATE new cohabitation certificate
app.post('/certificate-of-cohabitation', async (req, res) => {
  try {
    const {
      resident1_id,
      resident2_id,
      full_name1,
      dob1,
      full_name2,
      dob2,
      address,
      date_started,
      date_issued,
      witness1_name,
      witness2_name,
      transaction_number,
    } = req.body;

    // Match DB schema constraints: resident1_id, resident2_id, dob1, dob2 are NOT NULL
    if (
      !resident1_id ||
      !resident2_id ||
      !full_name1 ||
      !dob1 ||
      !full_name2 ||
      !dob2 ||
      !address ||
      !date_started ||
      !date_issued
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const finalTransactionNumber =
      transaction_number || `COH-${Date.now().toString().slice(-8)}`;

    const [result] = await pool.query(
      `INSERT INTO certificate_of_cohabitation
        (resident1_id, resident2_id, full_name1, dob1, full_name2, dob2, address, date_started, date_issued, witness1_name, witness2_name, transaction_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resident1_id,
        resident2_id,
        full_name1,
        dob1,
        full_name2,
        dob2,
        address,
        date_started,
        date_issued,
        witness1_name,
        witness2_name,
        finalTransactionNumber,
      ]
    );

    const [rows] = await pool.query(
      `SELECT * FROM certificate_of_cohabitation WHERE certificate_of_cohabitation_id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// UPDATE existing cohabitation certificate
app.put('/certificate-of-cohabitation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      resident1_id,
      resident2_id,
      full_name1,
      dob1,
      full_name2,
      dob2,
      address,
      date_started,
      date_issued,
      witness1_name,
      witness2_name,
      transaction_number,
    } = req.body;

    if (
      !resident1_id ||
      !resident2_id ||
      !full_name1 ||
      !dob1 ||
      !full_name2 ||
      !dob2 ||
      !address ||
      !date_started ||
      !date_issued
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await pool.query(
      `UPDATE certificate_of_cohabitation
       SET resident1_id=?, resident2_id=?, full_name1=?, dob1=?, full_name2=?, dob2=?, address=?, date_started=?, date_issued=?, witness1_name=?, witness2_name=?, transaction_number=?, date_updated=NOW()
       WHERE certificate_of_cohabitation_id=?`,
      [
        resident1_id,
        resident2_id,
        full_name1,
        dob1,
        full_name2,
        dob2,
        address,
        date_started,
        date_issued,
        witness1_name,
        witness2_name,
        transaction_number,
        id,
      ]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Record not found' });

    const [updated] = await pool.query(
      `SELECT * FROM certificate_of_cohabitation WHERE certificate_of_cohabitation_id = ?`,
      [id]
    );

    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// DELETE cohabitation certificate (soft delete)
app.delete('/certificate-of-cohabitation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `UPDATE certificate_of_cohabitation SET is_active = FALSE, date_updated = NOW() WHERE certificate_of_cohabitation_id = ?`,
      [id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});


// Get all solo parent records
app.get('/solo-parent-records', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        solo_parent_id,
        resident_id,
        transactionNum,
        full_name,
        address,
        dob,
        age,
        contact_no,
        residents_since_year,
        unwed_since_year,
        employment_status,
        employment_remarks,
        date_issued,
        transaction_number,
        is_active,
        date_created,
        date_updated
      FROM solo_parent_records
      WHERE is_active = 1
      ORDER BY date_created DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching solo parent records:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

// Get single solo parent record by ID
app.get('/solo-parent-records/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM solo_parent_records WHERE solo_parent_id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching solo parent record:', error);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

// Create new solo parent record
app.post('/solo-parent-records', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const {
      resident_id,
      full_name,
      age,
      address,
      dob,
      contact_no,
      residents_since_year,
      unwed_since_year,
      employment_status,
      employment_remarks,
      date_issued
    } = req.body;

    // Generate transaction number
    const transactionNum = `SP-${Date.now()}`;

    const [result] = await connection.query(`
      INSERT INTO solo_parent_records (
        resident_id,
        transactionNum,
        full_name,
        age,
        address,
        dob,
        contact_no,
        residents_since_year,
        unwed_since_year,
        employment_status,
        employment_remarks,
        date_issued,
        transaction_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      resident_id,
      transactionNum,
      full_name,
      age,
      address,
      dob,
      contact_no,
      residents_since_year,
      unwed_since_year,
      employment_status,
      employment_remarks,
      date_issued,
      transactionNum
    ]);

    await connection.commit();
    
    res.status(201).json({
      solo_parent_id: result.insertId,
      transactionNum,
      message: 'Solo parent record created successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating solo parent record:', error);
    res.status(500).json({ error: 'Failed to create record' });
  } finally {
    connection.release();
  }
});

// Update solo parent record
app.put('/solo-parent-records/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const {
      resident_id,
      full_name,
      age,
      address,
      dob,
      contact_no,
      residents_since_year,
      unwed_since_year,
      employment_status,
      employment_remarks,
      date_issued
    } = req.body;

    const [result] = await connection.query(`
      UPDATE solo_parent_records SET
        resident_id = ?,
        full_name = ?,
        age = ?,
        address = ?,
        dob = ?,
        contact_no = ?,
        residents_since_year = ?,
        unwed_since_year = ?,
        employment_status = ?,
        employment_remarks = ?,
        date_issued = ?
      WHERE solo_parent_id = ?
    `, [
      resident_id,
      full_name,
      age,
      address,
      dob,
      contact_no,
      residents_since_year,
      unwed_since_year,
      employment_status,
      employment_remarks,
      date_issued,
      req.params.id
    ]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Record not found' });
    }

    await connection.commit();
    res.json({ message: 'Solo parent record updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating solo parent record:', error);
    res.status(500).json({ error: 'Failed to update record' });
  } finally {
    connection.release();
  }
});

// Soft delete solo parent record
app.delete('/solo-parent-records/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const [result] = await connection.query(
      'UPDATE solo_parent_records SET is_active = 0 WHERE solo_parent_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Record not found' });
    }

    await connection.commit();
    res.json({ message: 'Solo parent record deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting solo parent record:', error);
    res.status(500).json({ error: 'Failed to delete record' });
  } finally {
    connection.release();
  }
});

// ==================== SOLO PARENT CHILDREN ENDPOINTS ====================
// Get all children for a solo parent
app.get('/solo-parent-children/:soloParentId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM solo_parent_children WHERE solo_parent_id = ? ORDER BY date_created ASC',
      [req.params.soloParentId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching children:', error);
    res.status(500).json({ error: 'Failed to fetch children' });
  }
});

// Create children for a solo parent (bulk insert)
app.post('/solo-parent-children/:soloParentId', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const soloParentId = req.params.soloParentId;
    const children = req.body; // Array of children

    if (!Array.isArray(children) || children.length === 0) {
      return res.status(400).json({ error: 'Invalid children data' });
    }

    // Delete existing children first
    await connection.query(
      'DELETE FROM solo_parent_children WHERE solo_parent_id = ?',
      [soloParentId]
    );

    // Insert new children
    const values = children.map(child => [
      soloParentId,
      child.child_name,
      child.child_age,
      child.child_birthday,
      child.child_level,
      child.child_level_remarks,
      child.child_gender,
      child.child_relationship,
      child.child_relationship_remarks
    ]);

    await connection.query(`
      INSERT INTO solo_parent_children (
        solo_parent_id,
        child_name,
        child_age,
        child_birthday,
        child_level,
        child_level_remarks,
        child_gender,
        child_relationship,
        child_relationship_remarks
      ) VALUES ?
    `, [values]);

    await connection.commit();
    res.status(201).json({ message: 'Children records created successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating children records:', error);
    res.status(500).json({ error: 'Failed to create children records' });
  } finally {
    connection.release();
  }
});

// Update children for a solo parent (replace all)
app.put('/solo-parent-children/:soloParentId', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const soloParentId = req.params.soloParentId;
    const children = req.body; // Array of children

    // Delete existing children
    await connection.query(
      'DELETE FROM solo_parent_children WHERE solo_parent_id = ?',
      [soloParentId]
    );

    // Insert new children if any
    if (Array.isArray(children) && children.length > 0) {
      const values = children.map(child => [
        soloParentId,
        child.child_name,
        child.child_age,
        child.child_birthday,
        child.child_level,
        child.child_level_remarks,
        child.child_gender,
        child.child_relationship,
        child.child_relationship_remarks
      ]);

      await connection.query(`
        INSERT INTO solo_parent_children (
          solo_parent_id,
          child_name,
          child_age,
          child_birthday,
          child_level,
          child_level_remarks,
          child_gender,
          child_relationship,
          child_relationship_remarks
        ) VALUES ?
      `, [values]);
    }

    await connection.commit();
    res.json({ message: 'Children records updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating children records:', error);
    res.status(500).json({ error: 'Failed to update children records' });
  } finally {
    connection.release();
  }
});

// Delete a specific child
app.delete('/solo-parent-children/:soloParentId/:childId', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM solo_parent_children WHERE child_id = ? AND solo_parent_id = ?',
      [req.params.childId, req.params.soloParentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Child record not found' });
    }

    res.json({ message: 'Child record deleted successfully' });
  } catch (error) {
    console.error('Error deleting child record:', error);
    res.status(500).json({ error: 'Failed to delete child record' });
  }
});

// ==================== SEARCH & STATISTICS ENDPOINTS ====================
// Search solo parent records
app.get('/solo-parent-records/search/:query', async (req, res) => {
  try {
    const searchQuery = `%${req.params.query}%`;
    const [rows] = await pool.query(`
      SELECT * FROM solo_parent_records
      WHERE is_active = 1
      AND (
        full_name LIKE ? OR
        address LIKE ? OR
        contact_no LIKE ? OR
        transaction_number LIKE ?
      )
      ORDER BY date_created DESC
    `, [searchQuery, searchQuery, searchQuery, searchQuery]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error searching records:', error);
    res.status(500).json({ error: 'Failed to search records' });
  }
});

// Get statistics
app.get('/solo-parent-statistics', async (req, res) => {
  try {
    const [totalRecords] = await pool.query(
      'SELECT COUNT(*) as count FROM solo_parent_records WHERE is_active = 1'
    );
    
    const [totalChildren] = await pool.query(
      'SELECT COUNT(*) as count FROM solo_parent_children'
    );
    
    const [recordsThisMonth] = await pool.query(`
      SELECT COUNT(*) as count FROM solo_parent_records
      WHERE is_active = 1
      AND MONTH(date_created) = MONTH(CURRENT_DATE())
      AND YEAR(date_created) = YEAR(CURRENT_DATE())
    `);

    res.json({
      totalRecords: totalRecords[0].count,
      totalChildren: totalChildren[0].count,
      recordsThisMonth: recordsThisMonth[0].count
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});



/**
 * BHERT CERTIFICATE NORMAL CRUD
 */

// GET all active BHERT records
app.get('/bhert-certificate-normal', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         bhert_certificate_normal_id, resident_id, full_name, address,
         requestor, purpose, date_issued, transaction_number,
         is_active, date_created, date_updated
       FROM bhert_certificate_normal
       WHERE is_active = TRUE
       ORDER BY bhert_certificate_normal_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch BHERT records' });
  }
});

// GET single record by ID
app.get('/bhert-certificate-normal/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT
         bhert_certificate_normal_id, resident_id, full_name, address,
         requestor, purpose, date_issued, transaction_number,
         is_active, date_created, date_updated
       FROM bhert_certificate_normal
       WHERE bhert_certificate_normal_id = ?`,
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

// GET record by transaction number
app.get('/bhert-certificate-normal/transaction/:transactionNumber', async (req, res) => {
  try {
    const { transactionNumber } = req.params;
    const [rows] = await pool.query(
      `SELECT
         bhert_certificate_normal_id, resident_id, full_name, address,
         requestor, purpose, date_issued, transaction_number,
         is_active, date_created, date_updated
       FROM bhert_certificate_normal
       WHERE transaction_number = ? AND is_active = TRUE`,
      [transactionNumber]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: 'Certificate not found' });

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

// CREATE new record
app.post('/bhert-certificate-normal', async (req, res) => {
  try {
    const {
      resident_id,
      full_name,
      address,
      requestor,
      purpose,
      date_issued,
      transaction_number,
    } = req.body;

    if (
      !resident_id ||
      !full_name ||
      !address ||
      !requestor ||
      !purpose ||
      !date_issued
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate transaction number if not provided
    const finalTransactionNumber =
      transaction_number || generateTransactionNumber();

    // Check for duplicate transaction number
    const [existing] = await pool.query(
      'SELECT bhert_certificate_normal_id FROM bhert_certificate_normal WHERE transaction_number = ?',
      [finalTransactionNumber]
    );

    // If exists, regenerate to avoid duplicate
    const newTxnNum =
      existing.length > 0 ? generateTransactionNumber() : finalTransactionNumber;

    const [result] = await pool.query(
      `INSERT INTO bhert_certificate_normal
       (resident_id, full_name, address, requestor, purpose, date_issued, transaction_number)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [resident_id, full_name, address, requestor, purpose, date_issued, newTxnNum]
    );

    const [rows] = await pool.query(
      `SELECT * FROM bhert_certificate_normal WHERE bhert_certificate_normal_id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// UPDATE existing record
app.put('/bhert-certificate-normal/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      resident_id,
      full_name,
      address,
      requestor,
      purpose,
      date_issued,
      transaction_number,
    } = req.body;

    if (
      !full_name ||
      !address ||
      !requestor ||
      !purpose ||
      !date_issued
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate transaction number uniqueness if updated
    if (transaction_number) {
      const [existing] = await pool.query(
        'SELECT bhert_certificate_normal_id FROM bhert_certificate_normal WHERE transaction_number = ? AND bhert_certificate_normal_id != ?',
        [transaction_number, id]
      );
      if (existing.length > 0)
        return res.status(400).json({ error: 'Transaction number already exists' });
    }

    const [result] = await pool.query(
      `UPDATE bhert_certificate_normal
       SET resident_id = ?, full_name = ?, address = ?, requestor = ?,
           purpose = ?, date_issued = ?, transaction_number = COALESCE(?, transaction_number),
           date_updated = NOW()
       WHERE bhert_certificate_normal_id = ?`,
      [
        resident_id,
        full_name,
        address,
        requestor,
        purpose,
        date_issued,
        transaction_number,
        id,
      ]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Record not found' });

    const [updatedRows] = await pool.query(
      `SELECT * FROM bhert_certificate_normal WHERE bhert_certificate_normal_id = ?`,
      [id]
    );

    res.json(updatedRows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// DELETE record (soft delete)
app.delete('/bhert-certificate-normal/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `UPDATE bhert_certificate_normal
       SET is_active = FALSE, date_updated = NOW()
       WHERE bhert_certificate_normal_id = ?`,
      [id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Record not found' });

    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});




app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
