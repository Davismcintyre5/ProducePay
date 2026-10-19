import express from 'express';

export default [
  express.json({ limit: '1mb' }),
  express.urlencoded({ extended: true, limit: '1mb' })
];