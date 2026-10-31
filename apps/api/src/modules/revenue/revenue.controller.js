import * as revenueService from './revenue.service.js';

export const getKPIs = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate y endDate son requeridos' });
    }
    const kpis = await revenueService.getKPIs(req.params.propertyId, startDate, endDate, req.user);
    res.json({ success: true, data: kpis });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};
