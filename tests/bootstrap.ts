import "reflect-metadata";

const now = Date.now();
Date.now = jest.fn().mockReturnValue( now );
