import mongoose from 'mongoose';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import Delivery from '../models/Delivery.js';
import Payment from '../models/Payment.js';
import Farmer from '../models/Farmer.js';
import { weekRangeInNairobi, roundKes } from '../utils/helpers.js';

export const dashboard = asyncHandler(async (req, res) => {
  const [
    totalFarmers,
    totalDeliveries,
    weightAgg,
    paymentAgg,
    recentDeliveries
  ] = await Promise.all([
    Farmer.countDocuments({ active: true }),
    Delivery.countDocuments({ deletedAt: null }),
    Delivery.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: null, total: { $sum: '$weightKg' } } }
    ]),
    Payment.aggregate([
      { $match: { status: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$amountKes' } } }
    ]),
    Delivery.find({ deletedAt: null }).sort({ createdAt: -1 }).limit(5)
  ]);

  res.status(200).json(ApiResponse.success({
    stats: {
      totalFarmers,
      totalDeliveries,
      totalWeightKg: roundKes(weightAgg[0]?.total || 0),
      totalPaidKes: roundKes(paymentAgg[0]?.total || 0)
    },
    recentDeliveries
  }));
});

export const weekly = asyncHandler(async (req, res) => {
  const { from, to } = weekRangeInNairobi(new Date());

  const [deliveryAgg] = await Delivery.aggregate([
    { $match: { collectedAt: { $gte: from, $lte: to }, deletedAt: null } },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        weight: { $sum: '$weightKg' },
        total: { $sum: '$totalKes' }
      }
    }
  ]);

  res.status(200).json(ApiResponse.success({
    weekFrom: from,
    weekTo: to,
    deliveries: deliveryAgg?.count || 0,
    weightKg: roundKes(deliveryAgg?.weight || 0),
    totalKes: roundKes(deliveryAgg?.total || 0)
  }));
});

export const farmerSummary = asyncHandler(async (req, res) => {
  const farmerObjectId = new mongoose.Types.ObjectId(req.params.id);

  const [deliveryAgg, paymentAgg] = await Promise.all([
    Delivery.aggregate([
      { $match: { farmer: farmerObjectId, deletedAt: null } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          weight: { $sum: '$weightKg' },
          total: { $sum: '$totalKes' }
        }
      }
    ]),
    Payment.aggregate([
      { $match: { farmer: farmerObjectId } },
      {
        $group: {
          _id: '$status',
          total: { $sum: '$amountKes' },
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  res.status(200).json(ApiResponse.success({
    deliveries: {
      count: deliveryAgg[0]?.count || 0,
      weightKg: roundKes(deliveryAgg[0]?.weight || 0),
      totalKes: roundKes(deliveryAgg[0]?.total || 0)
    },
    payments: paymentAgg.reduce((acc, row) => {
      acc[row._id] = { count: row.count, totalKes: roundKes(row.total) };
      return acc;
    }, {})
  }));
});

export const exportCsv = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const filter = { deletedAt: null };
  if (from || to) {
    filter.collectedAt = {};
    if (from) filter.collectedAt.$gte = new Date(from);
    if (to) filter.collectedAt.$lte = new Date(to);
  }

  const deliveries = await Delivery.find(filter).sort({ collectedAt: -1 }).limit(10000);

  const header = 'Code,Farmer,WeightKg,RatePerKg,TotalKes,CollectedAt\n';
  const rows = deliveries
    .map((d) =>
      [
        d.code,
        `"${d.farmerSnapshot.name}"`,
        d.weightKg,
        d.ratePerKg,
        d.totalKes,
        d.collectedAt.toISOString()
      ].join(',')
    )
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="deliveries.csv"');
  res.send(header + rows);
});

export default { dashboard, weekly, farmerSummary, exportCsv };