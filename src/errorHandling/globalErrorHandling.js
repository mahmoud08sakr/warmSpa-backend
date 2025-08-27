// Import translations
import translations from '../utilts/translations.js';

export const globalErrorHandling = (err, req, res, next) => {
  try {
    console.error('🚨 Global error handler caught:', err);

    // If response has already been sent, just log the error
    if (res.headersSent) {
      console.error('Response already sent, cannot send error response');
      return;
    }

    // Handle different types of errors
    let statusCode = 500;
    let message = 'Internal server error';

    if (err.statusCode) {
      statusCode = err.statusCode;
      message = err.message;
    } else if (err.name === 'ValidationError') {
      statusCode = 400;
      message = 'Validation error';
    } else if (err.name === 'CastError') {
      statusCode = 400;
      message = 'Invalid ID format';
    } else if (err.code === 11000) {
      statusCode = 409;
      message = 'Duplicate field value';
    } else if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
    }

    // Get translation if available
    const translationEntry = translations[message] || { en: message, ar: message };

    const payload = {
      status: 'error',
      message: message,
      error: {
        en: translationEntry.en || message,
        ar: translationEntry.ar || message
      }
    };

    // Log the error for debugging
    console.error('📊 Error details:', {
      statusCode,
      message,
      stack: err.stack,
      url: req.url,
      method: req.method
    });

    return res.status(statusCode).json(payload);

  } catch (globalError) {
    console.error('🚨 Critical error in global error handler:', globalError);

    // Last resort - send a basic error response
    if (!res.headersSent) {
      return res.status(500).json({
        status: 'error',
        message: 'Critical server error',
        error: {
          en: 'Critical server error',
          ar: 'خطأ حرج في الخادم'
        }
      });
    }
  }
};