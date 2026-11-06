import { handleQuickScanRequest } from '../server/quick-scan.mjs';

export default {
  fetch(request) {
    return handleQuickScanRequest(request);
  },
};
