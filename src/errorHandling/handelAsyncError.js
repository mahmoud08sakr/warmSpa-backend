export const handleAsyncError = (apiFunction) => {
    return (req, res, next) => {
        try {
            Promise.resolve(apiFunction(req, res, next)).catch((error) => {
                console.error('🚨 Error caught by handleAsyncError:', error);

                // If response has already been sent, just log the error
                if (res.headersSent) {
                    console.error('Response already sent, cannot send error response');
                    return;
                }

                // Send a proper error response
                res.status(error.statusCode || 500).json({
                    status: 'error',
                    message: error.message || 'Internal server error',
                    error: {
                        en: error.message || 'Internal server error',
                        ar: error.message || 'خطأ في الخادم الداخلي'
                    }
                });
            });
        } catch (syncError) {
            console.error('🚨 Synchronous error in handleAsyncError:', syncError);

            if (!res.headersSent) {
                res.status(500).json({
                    status: 'error',
                    message: 'Internal server error',
                    error: {
                        en: 'Internal server error',
                        ar: 'خطأ في الخادم الداخلي'
                    }
                });
            }
        }
    };
};