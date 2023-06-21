const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

const typeDefs = gql`
  type Query {
    studentAttendance(studentId: Int!, startDate: String!, endDate: String!): [Attendance!]!
  }

  type Mutation {
    markAttendance(studentId: Int!, date: String!): Attendance!
  }

  type Attendance {
    id: ID!
    studentId: Int!
    date: String!
  }
`;

const resolvers = {
  Query: {
    studentAttendance: async (_, { studentId, startDate, endDate }) => {
      const attendances = await prisma.attendance.findMany({
        where: {
          studentId,
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      });
      return attendances;
    },
  },
  Mutation: {
    markAttendance: async (_, { studentId, date }) => {
      const attendance = await prisma.attendance.create({
        data: {
          studentId,
          date: new Date(date),
        },
      });
      return attendance;
    },
  },
};

async function startApolloServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  const app = express();
  server.applyMiddleware({ app });

  const port = 4000;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

startApolloServer();
//postgresql://paras:12345678@localhost:5432/attendanceapp
