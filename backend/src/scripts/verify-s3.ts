import {
  S3Client,
  HeadBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config/env.js';

async function runS3Verification() {
  console.log('\n======================================================');
  console.log('   🔍 CloudVault AWS S3 Diagnostic & Verification');
  console.log('======================================================\n');

  console.log('1. Checking Environment Variables:');
  console.log(`   - Region: ${config.aws.region || 'NOT SET'}`);
  console.log(`   - Bucket: ${config.aws.bucketName || 'NOT SET'}`);
  console.log(`   - Access Key ID: ${config.aws.accessKeyId ? config.aws.accessKeyId.substring(0, 6) + '...' : 'NOT SET'}`);
  console.log(`   - Secret Key Configured: ${config.aws.secretAccessKey ? 'YES' : 'NO'}`);

  if (!config.aws.isConfigured) {
    console.log('\n⚠️  AWS S3 IS CURRENTLY OPERATING IN LOCAL DEVELOPMENT SIMULATION.');
    console.log('   Reason: Placeholder or missing AWS credentials in backend/.env.');
    console.log('\n   To connect a live AWS S3 bucket:');
    console.log('   1. Open backend/.env');
    console.log('   2. Set your AWS credentials:');
    console.log('      AWS_REGION=us-east-1');
    console.log('      AWS_ACCESS_KEY_ID=AKIA...');
    console.log('      AWS_SECRET_ACCESS_KEY=...');
    console.log('      AWS_S3_BUCKET_NAME=my-cloudvault-bucket');
    console.log('   3. Apply S3 CORS configuration:');
    console.log('      aws s3api put-bucket-cors --bucket <bucket-name> --cors-configuration file://s3-cors-policy.json');
    console.log('   4. Re-run: npm run verify:s3\n');
    process.exit(0);
  }

  const client = new S3Client({
    region: config.aws.region,
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    },
  });

  const testKey = `_diagnostic/healthcheck-${Date.now()}.txt`;

  try {
    console.log('\n2. Testing HeadBucket access...');
    await client.send(new HeadBucketCommand({ Bucket: config.aws.bucketName }));
    console.log('   ✅ HeadBucket check passed: Bucket exists and is accessible.');

    console.log('\n3. Testing PutObject permission...');
    await client.send(
      new PutObjectCommand({
        Bucket: config.aws.bucketName,
        Key: testKey,
        Body: Buffer.from('CloudVault diagnostic verification payload'),
        ContentType: 'text/plain',
      })
    );
    console.log(`   ✅ PutObject passed: Uploaded test object "${testKey}".`);

    console.log('\n4. Testing Presigned URL generation...');
    const presignedUrl = await getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: config.aws.bucketName,
        Key: testKey,
      }),
      { expiresIn: 300 }
    );
    console.log('   ✅ Presigned URL generation passed.');
    console.log(`   Sample URL preview: ${presignedUrl.substring(0, 60)}...`);

    console.log('\n5. Cleaning up test object...');
    await client.send(
      new DeleteObjectCommand({
        Bucket: config.aws.bucketName,
        Key: testKey,
      })
    );
    console.log('   ✅ DeleteObject passed: Test object successfully removed.');

    console.log('\n🎉 ALL AWS S3 INTEGRATION CHECKS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  } catch (err: unknown) {
    const error = err as Error;
    console.error('\n❌ AWS S3 Verification Failed:');
    console.error(`   ${error.message}\n`);
    console.error('Possible Causes:');
    console.error('1. Invalid AWS Access Key ID or Secret Access Key.');
    console.error('2. Bucket name does not exist or region mismatch.');
    console.error('3. IAM User lacks s3:PutObject, s3:GetObject, or s3:DeleteObject permissions.');
    console.error('4. S3 Bucket has restrictive bucket policies.');
    process.exit(1);
  }
}

runS3Verification();
