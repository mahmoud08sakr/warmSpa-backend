import PDFDocument from 'pdfkit';
import productModel from '../database/model/product.model.js';
import AgentProduct from '../database/model/agentProducts.js';

export const generateInvoicePDF = async (order, userData, products, productMap, agentProducts, agentMap) => {
    if (!order || !userData || !products || !productMap || !agentProducts || !agentMap) {
        throw new AppError('Missing required data for PDF generation', 400);
    }

    const pdf = new PDFDocument();
    const pdfBuffers = [];
    pdf.on('data', pdfBuffers.push.bind(pdfBuffers));

    // Invoice Header
    pdf.fontSize(20).text('Invoice', { align: 'center' });
    pdf.fontSize(12).text(`Order ID: ${order._id}`, { align: 'center' });
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' });
    pdf.moveDown();

    // Customer Information
    pdf.fontSize(14).text('Customer Information');
    pdf.fontSize(12).text(`Name: ${userData.name}`);
    pdf.text(`Email: ${userData.email}`);
    pdf.text(`Shipping Address: ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`);
    pdf.moveDown();

    // Order Details
    pdf.fontSize(14).text('Order Details');
    pdf.fontSize(12).text(`Order Date: ${new Date(order.orderdAt || Date.now()).toLocaleDateString()}`);
    pdf.text(`Service Type: ${order.serviceType || 'N/A'}`);
    pdf.text(`Payment Method: ${order.paymentMethod}`);
    pdf.text(`Total Price: ${order.totalPrice}`);
    pdf.text(`Order Status: ${order.orderStatus}`);
    pdf.text(`Tracking Code: ${order.trackingCode}`);
    pdf.moveDown();

    // Order Items
    pdf.fontSize(14).text('Order Items');
    pdf.fontSize(12).text('----------------------------------------------------------------------------------');
    const items = await Promise.all(products.map(async ({ productId, quantity }) => {
        const product = productMap[productId.toString()] || (await productModel.findById(productId).lean());
        const agentProduct = agentProducts.find(ap => ap._id.toString() === productId.toString());
        const agent = agentProduct ? agentMap[agentProduct.agentId.toString()] : { name: 'Unknown Agent' };
        return {
            name: product?.name?.en || 'Unknown Product',
            agent: agent.name,
            quantity,
            price: product?.price || 0,
            priceAfterDiscount: product?.priceAfterDiscount || product?.price || 0,
            total: quantity * (product?.priceAfterDiscount || product?.price || 0),
        };
    }));
    items.forEach(item => {
        pdf.text(`${item.name} | Agent: ${item.agent} | Quantity: ${item.quantity} | Unit Price: ${item.priceAfterDiscount} | Total: ${item.total}`);
        pdf.moveDown();
    });
    pdf.text('----------------------------------------------------------------------------------');
    pdf.text(`Total Price: ${order.totalPrice}`, { align: 'right' });
    pdf.moveDown();
    pdf.text('Thank you for your purchase! For inquiries, contact support@example.com.', { align: 'center' });
    pdf.end();

    return new Promise((resolve) => {
        pdf.on('end', () => {
            resolve(Buffer.concat(pdfBuffers));
        });
    });
};


export const sendInvoicePDF = async (order, userData, agentMap) => {
    
    if (!order || !userData || !order.cartId?.cartItems || !agentMap) {
        console.error('Missing required data for PDF generation:', { order, userData, agentMap });
        throw new Error('Missing required data for PDF generation');
    }

    const pdf = new PDFDocument();
    const pdfBuffers = [];
    pdf.on('data', pdfBuffers.push.bind(pdfBuffers));

    // Invoice Header
    pdf.fontSize(20).text('Invoice', { align: 'center' });
    pdf.fontSize(12).text(`Order ID: ${order._id}`, { align: 'center' });
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' });
    pdf.moveDown();

    // Customer Information
    pdf.fontSize(14).text('Customer Information');
    pdf.fontSize(12).text(`Name: ${userData.name || 'Unknown'}`);
    pdf.text(`Email: ${userData.email || 'N/A'}`);
    pdf.text(
        `Shipping Address: ${order.shippingAddress.street || ''}, ${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''}, ${order.shippingAddress.postalCode || ''}, ${order.shippingAddress.country || ''}`
    );
    pdf.moveDown();

    // Order Details
    pdf.fontSize(14).text('Order Details');
    pdf.fontSize(12).text(`Order Date: ${new Date(order.orderdAt || Date.now()).toLocaleDateString()}`);
    pdf.text(`Service Type: ${order.serviceType || 'N/A'}`);
    pdf.text(`Payment Method: ${order.paymentMethod || 'N/A'}`);
    pdf.text(`Total Price: ${order.totalPrice || 0}`);
    pdf.text(`Order Status: ${order.orderStatus || 'N/A'}`);
    pdf.text(`Tracking Code: ${order.trackingCode || 'N/A'}`);
    pdf.moveDown();

    // Order Items
    pdf.fontSize(14).text('Order Items');
    pdf.fontSize(12).text('----------------------------------------------------------------------------------');
    const items = await Promise.all(
        order.cartId.cartItems.map(async (item) => {
            const agentProduct = await AgentProduct.findById(item.product._id).lean();
            const product = agentProduct?.productId || {};
            const agent = agentMap[agentProduct?.agentId?.toString()] || { name: 'Unknown Agent' };
            console.log('Item details:', { productId: item.product._id, product, agent });
            return {
                name: product?.name?.en || 'Unknown Product',
                agent: agent.name,
                quantity: item.quantity,
                price: item.price || 0,
                priceAfterDiscount: item.priceAfterDiscount || item.price || 0,
                total: item.quantity * (item.priceAfterDiscount || item.price || 0),
            };
        })
    );
    items.forEach((item) => {
        pdf.text(
            `${item.name} | Agent: ${item.agent} | Quantity: ${item.quantity} | Unit Price: ${item.priceAfterDiscount} | Total: ${item.total}`
        );
        pdf.moveDown();
    });
    pdf.text('----------------------------------------------------------------------------------');
    pdf.text(`Total Price: ${order.totalPrice || 0}`, { align: 'right' });
    pdf.moveDown();
    pdf.text('Thank you for your purchase! For inquiries, contact support@example.com.', { align: 'center' });
    pdf.end();

    console.log('PDF generated successfully');
    return new Promise((resolve) => {
        pdf.on('end', () => {
            const buffer = Buffer.concat(pdfBuffers);
            console.log('PDF buffer size:', buffer.length);
            resolve(buffer);
        });
    });
};