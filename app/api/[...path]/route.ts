import { NextRequest, NextResponse } from 'next/server';

// Get the backend API URL from environment variables
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.236.171.71';
const API_VERSION = 'v1';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'PUT');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'DELETE');
}

async function handleRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    // Reconstruct the API path
    const apiPath = `/${pathSegments.join('/')}`;
    
    // Build the full backend URL
    const backendUrl = `${BACKEND_API_URL}/${API_VERSION}${apiPath}`;
    
    // Get query parameters from the request
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = searchParams 
      ? `${backendUrl}?${searchParams}` 
      : backendUrl;

    // Get headers from the request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward authorization header if present
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers,
    };

    // Add body for methods that support it
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        // Try to get body as JSON first
        const contentType = request.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const body = await request.json();
          requestOptions.body = JSON.stringify(body);
        } else if (contentType?.includes('multipart/form-data')) {
          // For multipart/form-data, forward as FormData
          const formData = await request.formData();
          requestOptions.body = formData;
          // Remove Content-Type header to let fetch set it with boundary
          delete headers['Content-Type'];
        } else {
          // For other content types, forward as-is
          requestOptions.body = await request.text();
          if (contentType) {
            headers['Content-Type'] = contentType;
          }
        }
      } catch (error) {
        console.error('Error parsing request body:', error);
      }
    }

    // Make the request to the backend
    const response = await fetch(fullUrl, requestOptions);

    // Get response data and content type
    const contentType = response.headers.get('content-type') || 'application/json';
    let nextResponse: NextResponse;
    
    if (contentType.includes('application/json')) {
      // JSON response
      const data = await response.json();
      nextResponse = NextResponse.json(data, {
        status: response.status,
        statusText: response.statusText,
      });
    } else if (contentType.includes('text/')) {
      // Text response
      const data = await response.text();
      nextResponse = new NextResponse(data, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': contentType,
        },
      });
    } else {
      // Binary response (images, files, etc.)
      const data = await response.arrayBuffer();
      nextResponse = new NextResponse(data, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': contentType,
        },
      });
    }

    // Add CORS headers
    nextResponse.headers.set('Access-Control-Allow-Origin', '*');
    nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Forward important headers from backend
    const cacheControl = response.headers.get('cache-control');
    if (cacheControl) {
      nextResponse.headers.set('Cache-Control', cacheControl);
    }
    
    // Forward content-type if not already set
    if (!nextResponse.headers.has('Content-Type') && contentType) {
      nextResponse.headers.set('Content-Type', contentType);
    }

    return nextResponse;
  } catch (error: any) {
    console.error('API Proxy Error:', {
      path: pathSegments.join('/'),
      method,
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: 'Proxy request failed',
        message: error.message,
        path: pathSegments.join('/'),
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
